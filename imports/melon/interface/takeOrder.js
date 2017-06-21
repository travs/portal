// @flow
import BigNumber from 'bignumber.js';
import contract from 'truffle-contract';
import VaultJson from '@melonproject/protocol/build/contracts/Vault.json';

import web3 from '/imports/lib/web3';
import removePrecision from './helpers/removePrecision';
import addressList from './addressList';
import getOrder from './getOrder';

/*
  @param quantityAsked: BigNumber with Precision (i.e. '1.234' NOT '1234')
*/
const takeOrder = (
  id: number,
  managerAddress: string,
  coreAddress: string,
  quantityAsked: BigNumber,
) =>
  getOrder(id).then(async (order) => {
    const Vault = contract(VaultJson);

    const quantity = !quantityAsked || quantityAsked.gte(order.sell.howMuch)
      ? order.sell.howMuch
      : quantityAsked;

    Vault.setProvider(web3.currentProvider);
    const coreContract = Vault.at(coreAddress);

    const result = await coreContract.takeOrder(
      addressList.exchange,
      order.id,
      removePrecision(quantity, order.sell.symbol),
      { from: managerAddress },
    );

    return result
      ? {
        executedQuantity: quantity,
        result,
      }
      : null;
  });

export default takeOrder;
