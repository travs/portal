/* global web3 */
import contract from 'truffle-contract';

import addressList from '/imports/melon/interface/addressList';
import EtherTokenJson from '/imports/melon/contracts/EtherToken.json';

const EtherToken = contract(EtherTokenJson);
EtherToken.setProvider(web3.currentProvider);
const etherTokenContract = EtherToken.at(addressList.etherToken);

/*
  @param quantity: BigNumber
*/
const depositAndApproveEther = (fromAddress, toBeApprovedAddress, quantity) =>
  etherTokenContract.deposit({ from: fromAddress, value: quantity })
  .then(() => etherTokenContract.approve(
      toBeApprovedAddress, quantity, { from: fromAddress }));

export default depositAndApproveEther;
