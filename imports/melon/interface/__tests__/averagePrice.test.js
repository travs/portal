import BigNumber from 'bignumber.js';

import matchedOrders from '../__fixtures__/matchedOrders.json';
import orderBigNumberify from '../helpers/orderBigNumberify';

// MUT (Module under test)
import averagePrice from '../averagePrice';


test('average price', () => {
  const matchedOrdersBigNumber = matchedOrders.map(orderBigNumberify);

  expect(averagePrice('buy', matchedOrdersBigNumber)).toBeInstanceOf(BigNumber);
  expect(averagePrice('buy', matchedOrdersBigNumber.slice(0, 1)).toNumber()).toEqual(10 / 3);
  expect(averagePrice('sell', matchedOrdersBigNumber.slice(0, 1)).toNumber()).toEqual(0.3);

  expect(averagePrice('buy', matchedOrdersBigNumber).toNumber()).toEqual(2.857142857142857);
  expect(averagePrice('sell', matchedOrdersBigNumber).toNumber()).toEqual(0.35);
});
