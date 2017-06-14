/* global web3 */
import contract from 'truffle-contract';
import SubscribeJson from '@melonproject/protocol/build/contracts/Subscribe.json';

import addressList from '/imports/melon/interface/addressList';
import depositAndApproveEther from './depositAndApproveEther';


const Subscribe = contract(SubscribeJson);
Subscribe.setProvider(web3.currentProvider);
const subscribeContract = Subscribe.at(addressList.subscribe);

/*
  @param quantityAsked: BigNumber quantity of Shares wanted to receive
  @param quantityOffered: BigNumber quantitiy of Ether willing to offer
*/
// const subscribe = (id, managerAddress, coreAddress, quantityAsked, quantityOffered) => {
//   depositAndApproveEther(managerAddress, addressList.subscribe, quantityOffered).then(() => subscribeContract.createSharesWithReferenceAsset(
//         coreAddress, quantityAsked, quantityOffered, { from: managerAddress })).then(result => result);
// };

const subscribe = (
  id, managerAddress, coreAddress, quantityAsked, quantityOffered,
  ) =>
  depositAndApproveEther(managerAddress, coreAddress, quantityOffered).then(async () => {
    console.log('deposit and approve done');
    const result = await subscribeContract.createSharesWithReferenceAsset(
      coreAddress, quantityAsked, quantityOffered, { from: managerAddress },
      );

    return result ? {
      sharesCreated: quantityAsked,
      result,
    } : null;
  });

export default subscribe;
