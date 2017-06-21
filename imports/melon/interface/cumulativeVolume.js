import BigNumber from 'bignumber.js';

/*
  @pre: orders are retrieved from the matchOrders (sorted, and filtered)
        and BigNumberified
*/
const cumulativeVolume = (orderType, orders) => {
  if (orderType === 'buy') {
    return orders.reduce(
      (accumulator, current) => accumulator.add(current.buy.howMuch),
      new BigNumber(0),
    );
  } else if (orderType === 'sell') {
    return orders.reduce(
      (accumulator, current) => accumulator.add(current.sell.howMuch),
      new BigNumber(0),
    );
  }

  throw new Error('You need to specify orderType to be either "sell" or "buy"');
};

export default cumulativeVolume;
