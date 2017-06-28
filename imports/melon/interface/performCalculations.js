import contract from 'truffle-contract';
import web3 from '/imports/lib/web3/client';
import VaultJson from '@melonproject/protocol/build/contracts/Vault.json';

const performCalculations = async (vaultAddress, precision = 18) => {
  const Vault = contract(VaultJson);
  Vault.setProvider(web3.currentProvider);
  const vaultContract = Vault.at(vaultAddress);

  const calculations = await vaultContract.performCalculations();

  return {
    gav: calculations[0].div(Math.pow(10, precision)),
    managementFee: calculations[1].div(Math.pow(10, precision)),
    performanceFee: calculations[2].div(Math.pow(10, precision)),
    unclaimedFees: calculations[3].div(Math.pow(10, precision)),
    nav: calculations[4].div(Math.pow(10, precision)),
    sharePrice: calculations[5].div(Math.pow(10, precision)),
  };
};

export default performCalculations;
