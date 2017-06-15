/* global web3 */
import contract from 'truffle-contract';
import EtherTokenJson from '@melonproject/protocol/build/contracts/EtherToken.json';
import web3 from '/imports/lib/web3';
import addressList from './addressList';


/*
  @param quantity: BigNumber
*/
const depositAndApproveEther = (fromAddress, toBeApprovedAddress, quantity) => {
  const EtherToken = contract(EtherTokenJson);
  EtherToken.setProvider(web3.currentProvider);
  const etherTokenContract = EtherToken.at(addressList.etherToken);

  return etherTokenContract.deposit({ from: fromAddress, value: quantity })
    // .then(() => etherTokenContract.approve(
    //     toBeApprovedAddress, quantity, { from: fromAddress }))
    .then(() => etherTokenContract.approve(
        addressList.subscribe, quantity, { from: fromAddress }));
};

export default depositAndApproveEther;
