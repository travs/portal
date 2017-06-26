import ensureBigNumber from './ensureBigNumber';

const getPrices = order => ({
  buy: ensureBigNumber(order.sell.howMuch).div(order.buy.howMuch),
  sell: ensureBigNumber(order.buy.howMuch).div(order.sell.howMuch),
});

export default getPrices;
