import BigNumber from 'bignumber.js';

/*
  @param order: an order returned by the database (with howMuch as string with precision)
  @returns: howMuch as BigNumber with precision (to use in code)
*/
const deserializeOrder = (order) => {
  const result = order;
  result.buy.howMuch = new BigNumber(order.buy.howMuch);
  result.sell.howMuch = new BigNumber(order.sell.howMuch);
  return result;
};

export default deserializeOrder;
