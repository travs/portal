import contract from 'truffle-contract';

import getOrder from '../getOrder';

jest.mock('/imports/lib/web3', () => jest.fn(), { virtual: true });
jest.mock('truffle-contract');


test('getOrder', async () => {
  const order = await getOrder(6870);

  expect(order.sell.howMuchPrecise).toBe('855505176');
  expect(contract).toHaveBeenCalledTimes(1);
  expect(contract().setProvider).toHaveBeenCalledTimes(1);
  expect(contract.mockInspect.instance.orders).toHaveBeenCalledWith(6870);
});
