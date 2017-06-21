const getPrices = order => ({
  buy: order.sell.howMuch.div(order.buy.howMuch),
  sell: order.buy.howMuch.div(order.sell.howMuch),
});

export default getPrices;
