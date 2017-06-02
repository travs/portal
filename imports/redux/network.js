// @flow
type Providers = 'MetaMask' | 'Mist' | 'Parity' | 'LocalNode' | 'Unknown';
type Networks = 'Rinkeby' | 'Ropsten' | 'Kovan' | 'Main' | 'Private';

export const initialState: {
  isConnected: boolean,
  network?: Networks,
  latestBlock: number,
  account?: string,
  provider?: Providers,
} = {
  isConnected: false,
  latestBlock: 0,
};

export const types = {
  INIT: 'INIT:network:portal.melonport.com',
};

export const creators = {
  init: ({ provider, isConnected }) => ({
    type: types.INIT,
    provider,
    isConnected,
  }),
};

export const reducer = (state = initialState, action) => {
  const { type, ...params } = action;

  switch (type) {
    // simple state updaters
    case types.INIT:
      return {
        ...state,
        ...params,
      };
    default:
      return state;
  }
};

export default reducer;
