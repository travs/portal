import contract from 'truffle-contract';
import web3 from '/imports/lib/web3/client';
import VaultJson from '@melonproject/protocol/build/contracts/Vault.json';

const getParticipation = async (vaultAddressn managerAddress) => {
  const Vault = contract(VaultJson);
  Vault.setProvider(web3.currentProvider);
  const vaultContract = Vault.at(vaultAddress);

  const personalStake = await vaultContract.balanceOf(managerAddress);
  const totalSupply = await vaultContract.totalSupply();

  return {personalStake: personalStake, totalSupply};
}

export default getParticipation;
