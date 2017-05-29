const getBestOrders = (orderType, priceThreshold, quantity, orders) => {
  if (orderType === 'buy') {
    return orders.filter(order =>
      (order.sell.howMuchPrecise / order.buy.howMuchPrecise) > priceThreshold,
    )
    .sort((a, b) => (
      (a.sell.howMuchPrecise / a.buy.howMuchPrecise)
      > (b.sell.howMuchPrecise / b.buy.howMuchPrecise)
      ? -1
      : 1),
    )
    .map(order => order.id);
  } else if (orderType === 'sell') {
    return orders.filter(order =>
      (order.buy.howMuchPrecise / order.sell.howMuchPrecise) > priceThreshold,
    )
    .sort((a, b) => (
      (a.buy.howMuchPrecise / a.sell.howMuchPrecise)
      > (b.buy.howMuchPrecise / b.sell.howMuchPrecise)
      ? -1
      : 1),
    )
    .map(order => order.id);
  }

  throw new Error('You need to specify orderType to be either "sell" or "buy"');
};


export default getBestOrders;
