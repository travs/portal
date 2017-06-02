import BigNumber from 'bignumber.js';
import contract from 'truffle-contract';

import web3 from '/imports/lib/web3';
import addressList from '/imports/melon/interface/addressList';
import CoreJson from '/imports/melon/contracts/Core.json';
import getOrder from './getOrder';

const Core = contract(CoreJson);

/*
  @param quantityAsked: BigNumber
*/
const takeOrder = (id, managerAddress, coreAddress, quantityAsked) =>
  getOrder(id).then((order) => {
    const quantity = quantityAsked || new BigNumber(order.sell.howMuchPrecise);
    Core.setProvider(web3.currentProvider);
    const coreContract = Core.at(coreAddress);

    console.log('taking order', order, {
      exchange: addressList.exchange,
      id: order.id,
      quantity: quantity.toString(),
      from: managerAddress,
    });

    return coreContract.takeOrder(
      addressList.exchange,
      order.id,
      quantity,
      { from: managerAddress });
  });


export default takeOrder;
