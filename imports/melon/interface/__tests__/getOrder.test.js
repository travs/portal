import contract from 'truffle-contract';

import getOrder from '../getOrder';

jest.mock('/imports/lib/web3', () => jest.fn(), { virtual: true });
jest.mock('truffle-contract');

test('getOrder', async () => {
  const order = await getOrder(6870);

  expect(order.sell.howMuch.eq('8.55505176')).toBeTruthy();
  expect(contract).toHaveBeenCalledTimes(1);
  expect(contract().setProvider).toHaveBeenCalledTimes(1);
  expect(contract().at).toHaveBeenCalled();
  expect(contract.mockInspect.instance.orders).toHaveBeenCalledWith(6870);
});
