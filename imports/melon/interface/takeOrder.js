// @flow
import BigNumber from 'bignumber.js';
import contract from 'truffle-contract';
import VaultJson from '@melonproject/protocol/build/contracts/Vault.json';

import web3 from '/imports/lib/web3';
import addressList from './addressList';
import orderBigNumberify from './helpers/orderBigNumberify';

import getOrder from './getOrder';

/*
  @param quantityAsked: BigNumber without Precision (i.e. '1234' NOT '1.234')
*/
const takeOrder = (
  id: number,
  managerAddress: string,
  coreAddress: string,
  quantityAsked: BigNumber,
) =>
  getOrder(id).then(async (rawOrder) => {
    const Vault = contract(VaultJson);
    const order = orderBigNumberify(rawOrder);
    const sellHowMuchPrecise = order.sell.howMuchBigNumber;

    const quantity =
      !quantityAsked || quantityAsked.gte(sellHowMuchPrecise)
      ? sellHowMuchPrecise
      : quantityAsked;

    Vault.setProvider(web3.currentProvider);
    const coreContract = Vault.at(coreAddress);

    if (!global.jest) {
      console.log('taking order', order, {
        exchange: addressList.exchange,
        id: order.id,
        quantity: quantity.toString(),
        from: managerAddress,
      });
    }

    const result = await coreContract.takeOrder(
      addressList.exchange,
      order.id,
      quantity,
      { from: managerAddress },
    );

    return result ? {
      executedQuantity: quantity,
      result,
    } : null;
  });


export default takeOrder;
