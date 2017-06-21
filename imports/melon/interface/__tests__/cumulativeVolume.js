import BigNumber from 'bignumber.js';

import matchedOrders from '../__fixtures__/matchedOrders';

// MUT (Module under test)
import cumulativeVolume from '../cumulativeVolume';

test('cumulativeVolume', () => {
  expect(cumulativeVolume('buy', matchedOrders)).toBeInstanceOf(BigNumber);
  expect(cumulativeVolume('buy', matchedOrders).toNumber()).toEqual(0.7);

  expect(cumulativeVolume('sell', matchedOrders).toNumber()).toEqual(2);
  expect(
    cumulativeVolume('sell', matchedOrders.slice(0, 1)).toNumber(),
  ).toEqual(1);
});
