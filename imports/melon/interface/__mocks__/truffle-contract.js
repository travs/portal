import orderBook from '../__fixtures__/blockChainOrders';

const instance = {
  orders: jest.fn(
    id =>
      new Promise((resolve) => {
        resolve(orderBook.find(o => o.id === id).data);
      }),
  ),
  takeOrder: jest.fn(
    (exchange, id, quantity, objects) =>
      new Promise((resolve) => {
        resolve({ tranactionHash: '0xBLUB' });
      }),
  ),
};

const contract = {
  setProvider: jest.fn(),
  at: jest.fn(() => instance),
};

const constructor = jest.fn(() => contract);
constructor.mockInspect = { instance, contract };

export default constructor;
