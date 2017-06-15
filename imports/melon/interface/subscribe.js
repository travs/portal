/* global web3 */
import contract from 'truffle-contract';
import SubscribeJson from '@melonproject/protocol/build/contracts/Subscribe.json';
import VaultJson from '@melonproject/protocol/build/contracts/Vault.json';
import addressList from '/imports/melon/interface/addressList';
import depositAndApproveEther from './depositAndApproveEther';

const Vault = contract(VaultJson);
Vault.setProvider(web3.currentProvider);


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

// const subscribe = (
//   id, managerAddress, coreAddress, quantityAsked, quantityOffered,
//   ) => {
//   const vaultContract = Vault.at(coreAddress);
//   vaultContract.getRefPriceForNumShares()
//   .then(async amountOfShares =>
//     depositAndApproveEther(managerAddress, coreAddress, amountOfShares),
//   ).then(async () => {
//     console.log('Deposit and approve done');
//     const result = await subscribeContract.createSharesWithReferenceAsset(
//           coreAddress, quantityAsked, quantityOffered, { from: managerAddress },
//           );

//     return result ? {
//       sharesCreated: quantityAsked,
//       result,
//     } : null;
//   });
// };

const subscribe = (
  id, managerAddress, coreAddress, quantityAsked, quantityOffered,
  ) => {
  console.log({ id, managerAddress, coreAddress, quantityAsked, quantityOffered });
  const vaultContract = Vault.at(coreAddress);
  return vaultContract.getRefPriceForNumShares(quantityAsked)
  .then((amountOfShares) => {
    console.log({ amountOfShares });
    return depositAndApproveEther(managerAddress, coreAddress, amountOfShares);
  }).then(() => {
    console.log('Deposit and approve done');
    return subscribeContract.createSharesWithReferenceAsset(
      coreAddress, quantityAsked, quantityOffered, { from: managerAddress },
    );
  });
};


export default subscribe;
