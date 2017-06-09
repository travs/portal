import BigNumber from 'bignumber.js';

// import contractMock from './__mocks__/truffle-contract';
import takeOrder from './takeOrder';


jest.mock('/imports/lib/web3', () => jest.fn(() => 42), { virtual: true });
const contractMock = jest.mock('truffle-contract');

console.log(contractMock);

test('takeOrder', async () => {
  const result = await takeOrder(6870, '0x', '0x', new BigNumber('9.55505176'));

  // console.log(contractMock.instances);
});
