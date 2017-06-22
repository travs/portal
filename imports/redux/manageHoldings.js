import Orders from '/imports/api/orders';
import filterByAssetPair from '/imports/melon/interface/query/filterByAssetPair';
import { default as calcAveragePrice } from '/imports/melon/interface/averagePrice';
import cumulativeVolume from '/imports/melon/interface/cumulativeVolume';
import matchOrders from '/imports/melon/interface/matchOrders';
import getPrices from '/imports/melon/interface/helpers/getPrices';

export const initialState = {
  selectedOrderId: undefined,
  orderType: 'buy',
  volume: undefined,
  averagePrice: undefined,
  total: undefined,
};

export const types = {
  SELECT_ORDER: 'SELECT_ORDER:manageHoldings:portal.melonport.com',
  ADJUST_ORDER: 'ADJUST_ORDER:manageHoldings:portal.melonport.com',
  TAKE_ORDER: 'TAKE_ORDER:manageHoldings:portal.melonport.com',
};

export const creators = {
  selectOrder: orderId => ({
    type: types.SELECT_ORDER,
    selectedOrderId: parseInt(orderId, 10),
  }),
  adjustOrder: ({ orderType, volume, averagePrice, total }) => ({
    type: types.ADJUST_ORDER,
    orderType,
    volume,
    averagePrice,
    total,
  }),
};

export const reducer = (state = initialState, action) => {
  const { type, ...params } = action;

  switch (type) {
    case types.SELECT_ORDER:
    case types.ADJUST_ORDER:
      return {
        ...state,
        ...params,
      };
    default:
  }

  return state;
};

// TODO: Refactor this middleware out of here (this file should be without Meteor/Blockchain deps)
export const middleware = store => next => (action) => {
  const { type, ...params } = action;

  switch (type) {
    case types.SELECT_ORDER: {
      const {
        baseTokenSymbol,
        quoteTokenSymbol,
      } = store.getState().preferences.currentAssetPair;
      const selectedOrder = Orders.findOne({ id: params.selectedOrderId });
      const orderType = selectedOrder.sell.symbol === 'ETH-T' ? 'buy' : 'sell';
      const orders = Orders.find(
        filterByAssetPair(baseTokenSymbol, quoteTokenSymbol, orderType, true),
      ).fetch();
      const matchedOrders = matchOrders(
        orderType,
        getPrices(selectedOrder)[orderType],
        orders,
      );
      const averagePrice = calcAveragePrice(orderType, matchedOrders);
      const volume = cumulativeVolume(orderType, matchedOrders);
      const total = volume.times(averagePrice);

      window.setTimeout(
        () =>
          store.dispatch(
            creators.adjustOrder({
              orderType,
              volume: volume.toString(),
              averagePrice: averagePrice.toString(),
              total: total.toString(),
            }),
          ),
        0,
      );
    }
    default:
  }

  return next(action);
};

export default reducer;
