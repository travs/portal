// @flow
import BigNumber from 'bignumber.js';

type OrderTypes = "buy" | "sell";

/*
  @pre: orders are only from the selected asset pair
  @pre: the orders are already BigNumberified
*/
const matchOrders = (
  orderType: OrderTypes,
  priceThreshold: BigNumber,
  quantity: BigNumber,
  orders: Array<mixed>,
) => {
  if (orderType === 'buy') {
    return orders.filter(order =>
      order.buy.priceBigNumber.gte(priceThreshold),
    )
    .sort((a, b) => (
      a.buy.priceBigNumber.gt(b.sell.priceBigNumber) ? -1 : 1),
    );
  } else if (orderType === 'sell') {
    return orders.filter(order =>
      order.sell.priceBigNumber.lte(priceThreshold),
    )
    .sort((a, b) => (
      a.sell.priceBigNumber.gt(b.buy.priceBigNumber) ? 1 : -1),
    );
  }

  throw new Error('You need to specify orderType to be either "sell" or "buy"');
};


export default matchOrders;
