import BigNumber from 'bignumber';


const orderBigNumberify = (order) => {
  const buyHowMuchBigNumber = new BigNumber(order.buy.howMuchPrecise)
      .div(Math.pow(10, order.buy.precision));
  const sellHowMuchBigNumber = new BigNumber(order.sell.howMuchPrecise)
      .div(Math.pow(10, order.sell.precision));

  return {
    ...order,
    buy: {
      ...order.buy,
      howMuchBigNumber: buyHowMuchBigNumber,
      priceBigNumber: sellHowMuchBigNumber.div(buyHowMuchBigNumber),
    },
    sell: {
      ...order.sell,
      howMuchBigNumber: sellHowMuchBigNumber,
      priceBigNumber: buyHowMuchBigNumber.div(sellHowMuchBigNumber),
    },
  };
};


export default orderBigNumberify;
