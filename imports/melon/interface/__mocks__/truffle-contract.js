import orderBook from '../__fixtures__/blockChainOrders';
import BigNumber from 'bignumber.js';
import subscribeResult from '../__fixtures__/subscribeResult';

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
  // Vault functions
  getRefPriceForNumShares: jest.fn((quantityAsked) => {
    expect(quantityAsked).toBeInstanceOf(BigNumber);
    return new Promise(resolve => resolve(new BigNumber(1)));
  }),
  // Subscribe functions
  createSharesWithReferenceAsset: jest.fn(
    (coreAddress, quantityAsked, quantityOffered, { from: managerAddress }) => {
      expect(typeof coreAddress).toBe('string');
      expect(typeof managerAddress).toBe('string');
      expect(quantityAsked).toBeInstanceOf(BigNumber);
      expect(quantityOffered).toBeInstanceOf(BigNumber);
      return new Promise(resolve => resolve(subscribeResult));
    }),
};

const contract = {
  setProvider: jest.fn(),
  at: jest.fn(() => instance),
};

const constructor = jest.fn(() => contract);
constructor.mockInspect = { instance, contract };


export default constructor;
