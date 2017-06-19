import BigNumber from 'bignumber.js';


const orderBigNumberify = (order) => {
  const buyHowMuchBigNumber = new BigNumber(order.buy.howMuchPrecise);
  const sellHowMuchBigNumber = new BigNumber(order.sell.howMuchPrecise);

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
