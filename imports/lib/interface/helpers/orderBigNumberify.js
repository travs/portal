import BigNumber from 'bignumber.js';


const orderBigNumberify = order => ({
  ...order,
  buy: {
    ...order.buy,
    howMuchBigNumber:
      new BigNumber(order.buy.howMuchPrecise)
      .div(Math.pow(10, order.buy.precision)),
  },
  sell: {
    ...order.sell,
    howMuchBigNumber:
      new BigNumber(order.sell.howMuchPrecise)
      .div(Math.pow(10, order.sell.precision)),
  },
});


export default orderBigNumberify;
