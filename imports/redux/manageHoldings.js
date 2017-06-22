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
    selectedOrderId: orderId,
  }),
};

export const reducer = (state = initialState, action) => {
  const { type, ...params } = action;

  switch (type) {
    case types.SELECT_ORDER:
      return {
        ...state,
        ...params,
      };
    default:
  }
  return state;
};

export const middleware = store => next => (action) => {
  const { type, ...params } = action;

  switch (type) {
    case types.SELECT_ORDER: {
      const [baseTokenSymbol, quoteTokenSymbol] = (store.preferences.currentAssetPair || '---/---').split('/');

      return {

      };
    }

  }
};

