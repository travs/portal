// @flow

import BigNumber from 'bignumber.js';

import takeOrder from './takeOrder';

/*
  @pre: orders are retrieved from the matchOrders (sorted, and filtered)
        and BigNumberified
  @returns: new BigNumber(0) if successful, otherwise it throws an Error
*/
const takeMultipleOrders = async (
  orders: Array,
  managerAddress: string,
  coreAddress: string,
  totalQuantityAsked: BigNumber,
) =>
  orders.reduce(async (remainingQuantity: BigNumber, currentOrder: any) => {
    if (remainingQuantity.gt(0)) {
      await takeOrder(
        currentOrder.id,
        managerAddress,
        coreAddress,
        remainingQuantity,
      );
      return remainingQuantity.minus(currentOrder.sell.howMuch);
    }

    return remainingQuantity;
  }, totalQuantityAsked);

export default takeMultipleOrders;
