import Orders from '/imports/api/orders';
import filterByAssetPair from '/imports/melon/interface/query/filterByAssetPair';
import { default as calcAveragePrice } from '/imports/melon/interface/averagePrice';
import cumulativeVolume from '/imports/melon/interface/cumulativeVolume';
import matchOrders from '/imports/melon/interface/matchOrders';
import getPrices from '/imports/melon/interface/helpers/getPrices';
import BigNumber from 'bignumber.js';
import { getBaseTokens, getQuoteTokens, getTokenPrecisionBySymbol } from '/imports/melon/interface/helpers/specs';

export const initialState = {
  selectedOrderId: undefined,
  orderType: 'buy',
  volume: undefined,
  maxVolume: undefined,
  maxTotal: undefined,
  averagePrice: undefined,
  total: undefined,
  currentAssetPair: {
    baseTokenSymbol: getBaseTokens()[0],
    quoteTokenSymbol: getQuoteTokens()[0],
  },
};

export const types = {
  CHANGE_VOLUME: 'CHANGE_VOLUME:manageHoldings:portal.melonport.com',
  CHANGE_TOTAL: 'CHANGE_TOTAL:manageHoldings:portal.melonport.com',
  SELECT_ASSET_PAIR: 'SELECT_ASSET_PAIR:preferences:portal.melonport.com',
  SELECT_ORDER: 'SELECT_ORDER:manageHoldings:portal.melonport.com',
  LOAD_ORDER: 'LOAD_ORDER:manageHoldings:portal.melonport.com',
  TAKE_ORDER: 'TAKE_ORDER:manageHoldings:portal.melonport.com',
};

export const creators = {
  changeVolume: volume => ({
    type: types.CHANGE_VOLUME,
    volume,
  }),
  changeTotal: total => ({
    type: types.CHANGE_TOTAL,
    total,
  }),
  selectAssetPair: assetPair => ({
    type: types.SELECT_ASSET_PAIR,
    assetPair,
  }),
  selectOrder: orderId => ({
    type: types.SELECT_ORDER,
    selectedOrderId: parseInt(orderId, 10),
  }),
  loadOrder: ({ orderType, volume, averagePrice, total }) => ({
    type: types.LOAD_ORDER,
    orderType,
    volume,
    averagePrice,
    total,
  }),
};

export const reducer = (state = initialState, action) => {
  const { type, ...params } = action;
  switch (type) {
    case types.CHANGE_VOLUME: {
      const volume = (new BigNumber(params.volume || 0)).gt(state.maxVolume)
        ? state.maxVolume
        : params.volume;
      return {
        ...state,
        volume,
        total: (new BigNumber(volume || 0)).times(state.averagePrice).toPrecision(getTokenPrecisionBySymbol(state.currentAssetPair.baseTokenSymbol)),
      };
    }
    case types.CHANGE_TOTAL: {
      const total = new BigNumber(params.total || 0).gt(state.maxTotal)
        ? state.maxTotal : params.total;
      return {
        ...state,
        total,
        volume: (new BigNumber(total || 0)).div(state.averagePrice).toPrecision(getTokenPrecisionBySymbol(state.currentAssetPair.quoteTokenSymbol)),
      };
    }
    case types.SELECT_ASSET_PAIR: {
      const [baseTokenSymbol, quoteTokenSymbol] = params.assetPair.split('/');
      return {
        ...state,
        currentAssetPair: {
          baseTokenSymbol,
          quoteTokenSymbol,
        },
      };
    }
    case types.LOAD_ORDER:
      return {
        ...state,
        ...params,
        maxVolume: params.volume,
        maxTotal: params.total,
      };
    case types.SELECT_ORDER:
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
  const currentState = store.getState().manageHoldings;
  const { type, ...params } = action;

  switch (type) {
    case types.SELECT_ASSET_PAIR:
      store.dispatch(
        creators.loadOrder({
          orderType: 'buy',
          volume: undefined,
          averagePrice: undefined,
          total: undefined,
        }),
      );
      break;
    case types.SELECT_ORDER: {
      const {
        baseTokenSymbol,
        quoteTokenSymbol,
      } = currentState.currentAssetPair;
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
            creators.loadOrder({
              orderType,
              volume: volume.toPrecision(
                getTokenPrecisionBySymbol(baseTokenSymbol),
              ),
              averagePrice: averagePrice.toPrecision(
                getTokenPrecisionBySymbol(quoteTokenSymbol),
              ),
              total: total.toPrecision(
                getTokenPrecisionBySymbol(baseTokenSymbol),
              ),
            }),
          ),
        0,
      );
      break;
    }
    default:
  }

  return next(action);
};

export default reducer;
