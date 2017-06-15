import contract from 'truffle-contract';
import SubscribeJson from '@melonproject/protocol/build/contracts/Subscribe.json';
import VaultJson from '@melonproject/protocol/build/contracts/Vault.json';
import addressList from './addressList';
import depositAndApproveEther from './depositAndApproveEther';
import web3 from '/imports/lib/web3';

/*
  @param quantityAsked: BigNumber quantity of Shares wanted to receive
  @param quantityOffered: BigNumber quantitiy of Ether willing to offer
*/

const subscribe = async (
  id, managerAddress, coreAddress, quantityAsked, quantityOffered,
) => {
  const Subscribe = contract(SubscribeJson);
  Subscribe.setProvider(web3.currentProvider);
  const subscribeContract = Subscribe.at(addressList.subscribe);
  const Vault = contract(VaultJson);
  Vault.setProvider(web3.currentProvider);
  const vaultContract = Vault.at(coreAddress);
  const price = await vaultContract.getRefPriceForNumShares(quantityAsked);

  await depositAndApproveEther(managerAddress, coreAddress, price);
  console.log('deposit and approve done');
  const result = await subscribeContract.createSharesWithReferenceAsset(
      coreAddress, quantityAsked, quantityOffered, { from: managerAddress },
  );
  console.log('result from createSharesWithReferenceAsset ', result);
  return result;
};


export default subscribe;
