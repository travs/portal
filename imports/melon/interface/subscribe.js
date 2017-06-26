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
const subscribe = (
  id,
  managerAddress,
  vaultAddress,
  quantityAsked,
  quantityOffered,
) => {
  depositAndApproveEther(
    managerAddress,
    vaultAddress,
    quantityOffered,
  ).then(() =>
    subscribeContract.createSharesWithReferenceAsset(
      vaultAddress,
      quantityAsked,
      quantityOffered,
      {
        from: managerAddress,
      },
    ),
  );
};

export default subscribe;
