import BigNumber from 'bignumber.js';

import orders from '../__fixtures__/orderBook';

import matchOrders from '../matchOrders';

test('matchOrders', () => {
  const sellMelonOrders = orders.filter(o => o.sell.symbol === 'MLN-T');
  const matchedOrders = matchOrders(
    'sell',
    new BigNumber(0.4),
    sellMelonOrders,
  );

  expect(matchedOrders.length).toBe(3);
  expect(matchedOrders.map(o => o.id)).toEqual([1, 2, 3]);
});
