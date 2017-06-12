import BigNumber from 'bignumber.js';

import matchedOrders from '../__fixtures__/matchedOrders.json';
import orderBigNumberify from '../helpers/orderBigNumberify';

// MUT (Module under test)
import cumulativeVolume from '../cumulativeVolume';


test('cumulativeVolume', () => {
  const matchedOrdersBigNumber = matchedOrders.map(orderBigNumberify);

  expect(cumulativeVolume('buy', matchedOrdersBigNumber)).toBeInstanceOf(BigNumber);
  expect(cumulativeVolume('buy', matchedOrdersBigNumber).toNumber()).toEqual(0.7);

  expect(cumulativeVolume('sell', matchedOrdersBigNumber).toNumber()).toEqual(2);
  expect(cumulativeVolume('sell', matchedOrdersBigNumber.slice(0, 1)).toNumber()).toEqual(1);
});
