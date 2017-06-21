/*
  @param order: an order returned by getOrder.js (with howMuch as BigNumber with precision)
  @returns: howMuch serialized as string (to save into database)
*/
const serializeOrder = (order) => {
  const result = order;
  result.buy.howMuch = order.buy.howMuch.toString();
  result.sell.howMuch = order.sell.howMuch.toString();
  result.timestamp = new Date(order.timestamp.times(1000).toNumber());
  return result;
};

export default serializeOrder;
