/* global web3 */
import contract from 'truffle-contract';
import RedeemJson from '@melonproject/protocol/build/contracts/Redeem.json';

import addressList from '/imports/melon/interface/addressList';

const Redeem = contract(RedeemJson);
Redeem.setProvider(web3.currentProvider);
const redeemContract = Redeem.at(addressList.redeem);

/*
  @param quantityAsked: BigNumber quantity of Shares wanted to redeem
*/
const redeem = (id, managerAddress, coreAddress, quantityAsked) =>
  redeemContract.redeemShares(coreAddress, quantityAsked, { from: managerAddress });

export default redeem;
