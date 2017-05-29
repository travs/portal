/*
  @pre: orders are only from the selected asset pair
  @pre: the orders are already BigNumberified
*/
const getBestOrders = (orderType, priceThreshold, quantity, orders) => {
  if (orderType === 'buy') {
    return orders.filter(order =>
      order.sell.howMuchBigNumber.div(order.buy.howMuchBigNumber).gte(priceThreshold),
    )
    .sort((a, b) => (
      a.sell.howMuchBigNumber.div(a.buy.howMuchBigNumber)
      .gt(b.sell.howMuchBigNumber.div(b.buy.howMuchBigNumber))
      ? -1
      : 1),
    )
    .map(order => order.id);
  } else if (orderType === 'sell') {
    return orders.filter(order =>
      order.buy.howMuchBigNumber.div(order.sell.howMuchBigNumber).lte(priceThreshold),
    )
    .sort((a, b) => (
      a.buy.howMuchBigNumber.div(a.sell.howMuchBigNumber)
      .gt(b.buy.howMuchBigNumber.div(b.sell.howMuchBigNumber))
      ? 1
      : -1),
    )
    .map(order => order.id);
  }

  throw new Error('You need to specify orderType to be either "sell" or "buy"');
};


export default getBestOrders;
