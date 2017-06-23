// @flow
type Providers = 'MetaMask' | 'Mist' | 'Parity' | 'LocalNode' | 'Unknown';
type Networks = 'Rinkeby' | 'Ropsten' | 'Kovan' | 'Main' | 'Private';

type State = {
  isConnected: boolean,
  isSynced: boolean,
  network?: Networks,
  currentBlock: number,
  account?: string,
  provider?: Providers,
  // balance in ETH is stored as a string with precision
  // '1.234' and not '1231'
  balance?: string,
  isServerConnected: boolean,
};

export const initialState: State = {
  isSynced: false,
  isConnected: false,
  isServerConnected: null,
  currentBlock: 0,
};

export const types = {
  UPDATE: 'UPDATE:network:portal.melonport.com',
};

export const creators = {
  update: newState => ({
    type: types.UPDATE,
    ...newState,
  }),
};

export const reducer = (state: State = initialState, action: string) => {
  const { type, ...params } = action;

  switch (type) {
    // simple state updaters
    case types.UPDATE:
      return {
        ...state,
        ...params,
      };
    default:
      return state;
  }
};

export default reducer;
