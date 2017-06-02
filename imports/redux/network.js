// @flow
type Providers = 'MetaMask' | 'Mist' | 'Parity' | 'LocalNode' | 'Unknown';
type Networks = 'Rinkeby' | 'Ropsten' | 'Kovan' | 'Main' | 'Private';

type State = {
  isConnected: boolean,
  network?: Networks,
  latestBlock: number,
  account?: string,
  provider?: Providers,
}

export const initialState: State = {
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

export const reducer = (state: State = initialState, action: string) => {
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
