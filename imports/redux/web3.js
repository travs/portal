// @flow
type Providers = 'MetaMask' | 'Mist' | 'Parity' | 'LocalNode' | 'Unknown';
type Networks = 'Rinkeby' | 'Ropsten' | 'Kovan' | 'Main' | 'Private';

type State = {
  isConnected: boolean,
  network?: Networks,
  latestBlock: number,
  account?: string,
  provider?: Providers,
  // balance in ETH is stored as a string with precision
  // '1.234' and not '1231'
  balance?: string,
}

export const initialState: State = {
  isConnected: false,
  latestBlock: 0,
};

export const types = {
  INIT: 'INIT:network:portal.melonport.com',
  SET_NETWORK: 'SET_NETWORK:network:portal.melonport.com',
  SET_ACCOUNT: 'SET_ACCOUNT:network:portal.melonport.com',
  SET_BALANCE: 'SET_BALANCE:network:portal.melonport.com',
};

export const creators = {
  init: ({ provider, isConnected }) => ({
    type: types.INIT,
    provider,
    isConnected,
  }),
  setNetwork: (network: Networks) => ({
    type: types.SET_NETWORK,
    network,
  }),
  setAccount: (account: string) => ({
    type: types.SET_ACCOUNT,
    account,
  }),
  setBalance: (balance: string) => ({
    type: types.SET_BALANCE,
    balance,
  }),
};

export const reducer = (state: State = initialState, action: string) => {
  const { type, ...params } = action;

  switch (type) {
    // simple state updaters
    case types.INIT:
    case types.SET_NETWORK:
    case types.SET_ACCOUNT:
    case types.SET_BALANCE:
      return {
        ...state,
        ...params,
      };
    default:
      return state;
  }
};

export default reducer;
