import BigNumber from 'bignumber.js';

const ensureBigNumber = (param) => {
  if (param instanceof BigNumber) return param;
  return new BigNumber(param);
};

export default ensureBigNumber;
