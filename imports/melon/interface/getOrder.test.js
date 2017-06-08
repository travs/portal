import getOrder from './getOrder';


jest.mock('/imports/lib/web3', () => jest.fn(() => 42), { virtual: true });
jest.mock('truffle-contract', () => jest.fn(() => ({
  setProvider: f => f,
  at: () => ({
    orders: id =>
      new Promise((resolve) => {
        const { default: orderBook } = require('./fixtures/blockChainOrders');

        resolve(orderBook.find(o => o.id === id).data);
      }),
  }),
})));

test('getOrder', async () => {
  const order = await getOrder(6870);

  expect(order.sell.howMuchPrecise).toBe('855505176');
});
