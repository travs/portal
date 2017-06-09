import BigNumber from 'bignumber.js';
import contract from 'truffle-contract';

import web3 from '/imports/lib/web3';
import addressList from './addressList';
import orderBigNumberify from './helpers/orderBigNumberify';
import CoreJson from '../contracts/Core.json';

import getOrder from './getOrder';

/*
  @param quantityAsked: BigNumber with Precision (i.e. '1.234' NOT '1234')
*/
const takeOrder = (id, managerAddress, coreAddress, quantityAsked) =>
  getOrder(id).then((order) => {
    const Core = contract(CoreJson);
    const orderBigNumberified = orderBigNumberify(order);
    const sellHowMuchPrecise = orderBigNumberified.sell.howMuchBigNumber;

    const quantityWithPrecision =
      !quantityAsked || quantityAsked.gte(sellHowMuchPrecise)
      ? sellHowMuchPrecise
      : quantityAsked;

    const quantity = quantityWithPrecision.times(Math.pow(10, orderBigNumberified.sell.precision));

    Core.setProvider(web3.currentProvider);
    const coreContract = Core.at(coreAddress);

    if (!jest) {
      console.log('taking order', order, {
        exchange: addressList.exchange,
        id: order.id,
        quantity: quantity.toString(),
        from: managerAddress,
      });
    }

    return coreContract.takeOrder(
      addressList.exchange,
      order.id,
      quantity,
      { from: managerAddress },
    );
  });


export default takeOrder;
