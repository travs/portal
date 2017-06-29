// @flow
import BigNumber from 'bignumber.js';
import type { Networks, DerivedState, State } from '../web3.js';

const isNetworkSupported = (network: Networks): boolean =>
  ['Kovan'].includes(network);

const getReadyState = (state: State): DerivedState => {
  const balance = new BigNumber(state.balance);

  if (
    balance.gt(0) &&
    isNetworkSupported(state.network) &&
    state.account &&
    state.isConnected &&
    state.isServerConnected
  ) {
    return {
      readyState: 'Ready',
      isReady: true,
    };
  } else if (
    isNetworkSupported(state.network) &&
    state.account &&
    state.isConnected &&
    state.isServerConnected
  ) {
    return {
      readyState: 'Insufficient Fund',
      isReady: false,
    };
  } else if (state.account && state.isConnected && state.isServerConnected) {
    return {
      readyState: 'Unsupported Network',
      isReady: false,
    };
  } else if (state.isConnected && state.isServerConnected) {
    return {
      readyState: 'No Account Selected',
      isReady: false,
    };
  } else if (state.isServerConnected) {
    return {
      readyState: 'Client Not Connected',
      isReady: false,
    };
  } else if (!state.isServerConnected) {
    return {
      readyState: 'Server Not Connected',
      isReady: false,
    };
  }

  return {
    readyState: 'Server Connected',
    isReady: false,
  };
};

export default getReadyState;
