import BigNumber from 'bignumber.js';
import contract from 'truffle-contract';

import web3 from '/imports/lib/web3';
import addressList from './addressList';
import orderBigNumberify from './helpers/orderBigNumberify';
import CoreJson from '../contracts/Core.json';

import getOrder from './getOrder';

/*
  @param quantityAsked: BigNumber
*/
const takeOrder = (id, managerAddress, coreAddress, quantityAsked) =>
  getOrder(id).then((order) => {
    const Core = contract(CoreJson);
    const orderBigNumberified = orderBigNumberify(order);
    const sellHowMuchPrecise = orderBigNumberified.sell.howMuchBigNumber;

    console.log(sellHowMuchPrecise);
    const quantity =
      !quantityAsked || quantityAsked.gte(sellHowMuchPrecise)
      ? sellHowMuchPrecise
      : quantityAsked;

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
      { from: managerAddress },
    );
  });


export default takeOrder;
