import contract from 'truffle-contract';
import BigNumber from 'bignumber.js';

import addressList from '../addressList';
import depositAndApproveEther from '../depositAndApproveEther';

jest.mock('/imports/lib/web3', () => jest.fn(() => 42), { virtual: true });

test('smoke test', async () => {
  await depositAndApproveEther('0x', addressList.subscribe, new BigNumber(1));
});

test('Check arguments', async () => {
  await depositAndApproveEther('0x', addressList.subscribe, new BigNumber(1));

  expect(contract.mockInspect.instance.deposit).toHaveBeenCalled();
  expect(contract.mockInspect.instance.approve).toHaveBeenCalled();
});
