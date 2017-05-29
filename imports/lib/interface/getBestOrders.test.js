/* global test, expect */
import orders from './fixtures/orderBook.js';

import getBestOrders from './getBestOrders';
import orderBigNumberify from './helpers/orderBigNumberify';


test('getBestOrders', () => {
  const sellMelonOrders = orders
  .filter(o => o.sell.symbol === 'MLN-T')
  .map(orderBigNumberify);

  expect(getBestOrders('sell', 0.4, 2, sellMelonOrders).length).toBe(2);
  expect(getBestOrders('sell', 0.4, 2, sellMelonOrders)).toEqual([1, 2]);
});
