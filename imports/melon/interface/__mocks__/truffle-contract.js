import orderBook from '../__fixtures__/blockChainOrders';
import BigNumber from 'bignumber.js';

const instance = {
  // Exchange functions
  orders: jest.fn(id => new Promise(resolve =>
    resolve(orderBook.find(o => o.id === id).data),
  )),
  takeOrder: jest.fn((exchange, id, quantity, objects) =>
    new Promise(resolve => resolve(true),
  )),
  // EtherToken functions
  deposit: jest.fn(({ from, value }) => {
    expect(typeof from).toBe('string');
    expect(value).toBeInstanceOf(BigNumber);
    return new Promise(resolve => resolve(true));
  }),
  approve: jest.fn(() => new Promise(resolve =>
      resolve(true)),
  ),
};

const contract = {
  setProvider: jest.fn(),
  at: jest.fn(() => instance),
};

const constructor = jest.fn(() => contract);
constructor.mockInspect = { instance, contract };


export default constructor;
