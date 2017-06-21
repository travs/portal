// @flow
import BigNumber from 'bignumber.js';

import { getTokenAddress, getTokenPrecisionByAddress } from './specs';

const removePrecision = (quantity: BigNumber, symbol: String) => {
  const tokenAddress = getTokenAddress(symbol);
  const precision = getTokenPrecisionByAddress(tokenAddress);
  return quantity.times(Math.pow(10, precision));
};

export default removePrecision;
