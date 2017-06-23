// @flow
import BigNumber from 'bignumber.js';

import getPrices from './helpers/getPrices';

type OrderTypes = 'buy' | 'sell';

/*
  @pre: orders are only from the selected asset pair
  @pre: the orders are from getOrder (howMuch as BigNumber)
  @returns: filtered and sorted set of orders
*/
const matchOrders = (orderType: OrderTypes, priceThreshold: BigNumber, orders: Array<mixed>) => {
  if (orderType === 'sell') {
    return orders
      .filter(order => getPrices(order).sell.lte(priceThreshold))
      .sort((a, b) => (getPrices(a).sell.gt(getPrices(b).sell) ? -1 : 1));
  } else if (orderType === 'buy') {
    return orders
      .filter(order => getPrices(order).buy.gte(priceThreshold))
      .sort((a, b) => (getPrices(a).buy.gt(getPrices(b).buy) ? -1 : 1));
  }

  throw new Error('You need to specify orderType to be either "sell" or "buy"');
};

export default matchOrders;
