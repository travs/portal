import orderBook from '../__fixtures__/blockChainOrders';


export default () => ({
  setProvider: f => f,
  at: () => ({
    orders: id =>
      new Promise(resolve =>
        resolve(orderBook.find(o => o.id === id).data),
      ),
    takeOrder: (exchange, id, quantity, objects) =>
      new Promise((resolve) => {
        console.log(quantity);
        resolve(true);
      }),
  }),
});
