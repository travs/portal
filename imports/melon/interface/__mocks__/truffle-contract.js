import orderBook from '../__fixtures__/blockChainOrders';


const contract = jest.fn(() => ({
  setProvider: jest.fn(),
  at: jest.fn(() => ({
    orders: jest.fn(id => new Promise(resolve =>
      resolve(orderBook.find(o => o.id === id).data),
    )),
    takeOrder: jest.fn((exchange, id, quantity, objects) =>
      new Promise((resolve) => {
        console.log(quantity);
        resolve(true);
      },
    )),
  })),
}));


export default contract;
