import getBestOrders from './getBestOrders';


const orders = [{
  id: 1,
  owner: '0x0',
  isActive: true,
  buy: {
    token: '0x0',
    symbol: 'MLN-T',
    howMuchPrecise: '2000 0000 0000 0000 00'.replace(' ', ''),
  },
  sell: {
    token: '0x1',
    symbol: 'ETH-T',
    howMuchPrecise: '1100 0000 0000 0000 00'.replace(' ', ''),
  },
}, {
  id: 2,
  owner: '0x0',
  isActive: true,
  buy: {
    token: '0x0',
    symbol: 'MLN-T',
    howMuchPrecise: '2000 0000 0000 0000 00'.replace(' ', ''),
  },
  sell: {
    token: '0x1',
    symbol: 'ETH-T',
    howMuchPrecise: '1200 0000 0000 0000 00'.replace(' ', ''),
  },
}, {
  id: 3,
  owner: '0x0',
  isActive: true,
  buy: {
    token: '0x0',
    symbol: 'MLN-T',
    howMuchPrecise: '2000 0000 0000 0000 00'.replace(' ', ''),
  },
  sell: {
    token: '0x1',
    symbol: 'ETH-T',
    howMuchPrecise: '1300 0000 0000 0000 00'.replace(' ', ''),
  },
}];

test('adds 1 + 2 to equal 3', () => {
  console.log(getBestOrders('buy', 0.5, 1, orders));
  // expect(sum(1, 2)).toBe(3);
});

