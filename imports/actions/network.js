// @flow
type Providers = 'MetaMask' | 'Mist' | 'Parity' | 'LocalNode' | 'Unknown';

export const initialState: {
  network: boolean,
  latestBlock: number,
  account?: string,
  provider?: Providers,
} = {
  network: false,
  latestBlock: 0,
};

export const types = {
  SET_NETWORK: 'SET_NETWORK:network:portal.melonport.com',
  SET_LATEST_BLOCK: 'SET_LATEST_BLOCK:network:portal.melonport.com',
  SET_PROVIDER: 'SET_PROVIDER:network:portal.melonport.com',
  SET_ACCOUNT: 'SET_ACCOUNT:network:portal.melonport.com',
};

export const creators = {

};

export const reducer = (state = initialState, action) => {
  const { type, ...params } = action;

  switch (type) {
    // simple state updaters
    case types.SET_NETWORK:
    case types.SET_LATEST_BLOCK:
    case types.SET_PROVIDER:
    case types.SET_ACCOUNT:
      return {
        ...state,
        ...params,
      };
    default:
      return state;
  }
};

export default reducer;
