import getOrder from '../getOrder';


jest.mock('/imports/lib/web3', () => jest.fn(() => 42), { virtual: true });
jest.mock('truffle-contract');

test('getOrder', async () => {
  const order = await getOrder(6870);

  expect(order.sell.howMuchPrecise).toBe('855505176');
});
