/* global web3 */
import { BigNumber } from 'meteor/ethereum:web3';
import contract from 'truffle-contract';

import AddressList from '/imports/melon/interface/addressList';
import CoreJson from '/imports/melon/contracts/Core.json';
import getOrder from './getOrder';


const Core = contract(CoreJson);
Core.setProvider(web3.currentProvider);

/*
  @param quantityAsked: BigNumber
*/
const takeOrder = (id, managerAddress, coreAddress, quantityAsked) =>
  getOrder(id).then((order) => {
    const quantity = quantityAsked || new BigNumber(order.sell.howMuchPrecise);
    const coreContract = Core.at(coreAddress);

    console.log('taking order', order, {
      exchange: AddressList.Exchange,
      id: order.id,
      quantity: quantity.toString(),
      from: managerAddress,
    });

    return coreContract.takeOrder(
      AddressList.Exchange,
      order.id,
      quantity,
      { from: managerAddress });
  });


export default takeOrder;
