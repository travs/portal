import BigNumber from 'bignumber';

/*
  @pre: orders are retrieved from the matchOrders (sorted, and filtered)
        and BigNumberified
*/

const averagePrice = (orderType, orders) => {
  const cumulatedVolumes = orders.reduce((accumulator, current) => ({
    buy: accumulator.buy.add(current.buy.howMuchBigNumber),
    sell: accumulator.sell.add(current.sell.howMuchBigNumber),
  }), {
    buy: new BigNumber(0),
    sell: new BigNumber(0),
  });

  if (orderType === 'buy') {
    return cumulatedVolumes.sell.div(cumulatedVolumes.buy);
  } else if (orderType === 'sell') {
    return cumulatedVolumes.buy.div(cumulatedVolumes.sell);
  }

  throw new Error('You need to specify orderType to be either "sell" or "buy"');
};


export default averagePrice;
