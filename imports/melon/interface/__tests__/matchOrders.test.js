import orders from '../__fixtures__/orderBook';

import matchOrders from '../matchOrders';
import orderBigNumberify from '../helpers/orderBigNumberify';


test('matchOrders', () => {
  const sellMelonOrders = orders
  .filter(o => o.sell.symbol === 'MLN-T')
  .map(orderBigNumberify);

  const matchedOrders = matchOrders('sell', 0.4, 2, sellMelonOrders);

  expect(matchedOrders.length).toBe(2);
  expect(matchedOrders.map(o => o.id)).toEqual([1, 2]);
});
