import BigNumber from 'bignumber.js';

import matchedOrders from './fixtures/matchedOrders.json';
import orderBigNumberify from './helpers/orderBigNumberify';

// MUT (Module under test)
import calcCumulativeVolume from './calcCumulativeVolume';


test('calcCumulativeVolume', () => {
  const matchedOrdersBigNumber = matchedOrders.map(orderBigNumberify);

  expect(calcCumulativeVolume('buy', matchedOrdersBigNumber)).toBeInstanceOf(BigNumber);
  expect(calcCumulativeVolume('buy', matchedOrdersBigNumber).toNumber()).toEqual(0.7);

  expect(calcCumulativeVolume('sell', matchedOrdersBigNumber).toNumber()).toEqual(2);
  expect(calcCumulativeVolume('sell', matchedOrdersBigNumber.slice(0, 1)).toNumber()).toEqual(1);
});
