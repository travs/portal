import BigNumber from 'bignumber';
import orderBigNumberify from './orderBigNumberify';


const order = {
  buy: {
    howMuchPrecise: '300000000000000000',
    precision: 18,
  },
  sell: {
    howMuchPrecise: '1000000000000000000',
    precision: 16,
  },
  /* ...truncated for simplicity of this test */
};


test('creates a big number for orders', () => {
  const bigNumberified = orderBigNumberify(order);

  // is it a big number
  expect(bigNumberified.buy.howMuchBigNumber instanceof BigNumber).toBeTruthy();
  expect(bigNumberified.sell.howMuchBigNumber instanceof BigNumber).toBeTruthy();

  // is the precision applied
  expect(bigNumberified.buy.howMuchBigNumber.toString()).toEqual('0.3');
  expect(bigNumberified.sell.howMuchBigNumber.toString()).toEqual('100');
});
