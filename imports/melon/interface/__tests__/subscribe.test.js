import contract from 'truffle-contract';
import BigNumber from 'bignumber.js';

import addressList from '../addressList';
import subscribe from '../subscribe';

jest.mock('/imports/lib/web3', () => jest.fn(() => 42), { virtual: true });

test('smoke test', async () => {
  await subscribe(1, '0x', '0x', new BigNumber(1), new BigNumber(1));
});

test('Test smart contract response', async () => {
  const result = await subscribe(1, '0xManager', '0xFund', new BigNumber(1), new BigNumber(1));

  expect(typeof result.tx).toBe('string');
  expect(result.logs.length).toBe(2);
  expect(result.logs[0].args.byParticipant).toBe('0xManager');
  expect(result.logs[0].event).toBe('SharesCreated');
});
