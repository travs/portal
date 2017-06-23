import BigNumber from 'bignumber.js';

import matchedOrders from '../__fixtures__/matchedOrders';

import takeMultipleOrders from '../takeMultipleOrders';

jest.mock('/imports/lib/web3', () => jest.fn(() => 42), { virtual: true });

test('buy 1.5 MLN from two orders: one full and one partial', async () => {
  const result = await takeMultipleOrders(matchedOrders, '0xMANAGER', '0xCORE', new BigNumber(1.5));

  expect(result).toBeTruthy();
  expect(result.remainingQuantity.eq(0)).toBeTruthy();
  expect(result.transactions).toHaveLength(2);
});
