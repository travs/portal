import specs from '/imports/melon/interface/helpers/specs.js';


export const initialState = {
  currentAssetPair: `${specs.getBaseTokens()[0]}/${specs.getQuoteTokens()[0]}`,
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
    case types.SELECT_ASSET_PAIR:
      return {
        ...state,
        assetPair: params.assetPair,
      };
    default:
      return state;
  }
};
