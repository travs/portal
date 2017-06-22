import { getBaseTokens, getQuoteTokens } from '/imports/melon/interface/helpers/specs';

export const initialState = {
  currentAssetPair: {
    baseTokenSymbol: getBaseTokens()[0],
    quoteTokenSymbol: getQuoteTokens()[0],
  },
};

export const types = {
  SELECT_ASSET_PAIR: 'SELECT_ASSET_PAIR:preferences:portal.melonport.com',
};

export const creators = {
  selectAssetPair: assetPair => ({
    type: types.SELECT_ASSET_PAIR,
    assetPair,
  }),
};

export const reducer = (state = initialState, action) => {
  const { type, ...params } = action;

  switch (type) {
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
    default:
      return state;
  }
};

export default reducer;
