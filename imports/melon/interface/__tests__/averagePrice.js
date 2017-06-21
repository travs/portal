import BigNumber from 'bignumber.js';

import matchedOrders from '../__fixtures__/matchedOrders.json';

// MUT (Module under test)
import averagePrice from '../averagePrice';

test('average price', () => {
  expect(averagePrice('buy', matchedOrders)).toBeInstanceOf(BigNumber);
  expect(averagePrice('buy', matchedOrders.slice(0, 1)).toNumber()).toEqual(
    10 / 3,
  );
  expect(averagePrice('sell', matchedOrders.slice(0, 1)).toNumber()).toEqual(
    0.3,
  );

  expect(averagePrice('buy', matchedOrders).toNumber()).toEqual(
    2.857142857142857,
  );
  expect(averagePrice('sell', matchedOrders).toNumber()).toEqual(0.35);
});
