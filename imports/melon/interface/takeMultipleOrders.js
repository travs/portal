// @flow

import BigNumber from 'bignumber.js';

import takeOrder from './takeOrder';

import ensureBigNumber from './helpers/ensureBigNumber';
/*
  @pre: orders are retrieved from the matchOrders (sorted, and filtered)
        and BigNumberified
  @returns: new BigNumber(0) if successful, otherwise it throws an Error
*/
const takeMultipleOrders = async (
  orders: Array,
  managerAddress: string,
  vaultAddress: string,
  totalQuantityAsked: BigNumber,
) =>
  orders.reduce(async (accumulatorPromise: Promise, currentOrder: any) => {
    const accumulator = await accumulatorPromise;
    const remainingQuantity = accumulator.remainingQuantity;

    if (remainingQuantity.gt(0)) {
      const result = await takeOrder(
        currentOrder.id,
        managerAddress,
        vaultAddress,
        remainingQuantity,
      );
      accumulator.remainingQuantity = remainingQuantity.minus(
        result.executedQuantity,
      );
      accumulator.transactions.push(result.transaction);
    }

    return accumulator;
  }, Promise.resolve({ remainingQuantity: ensureBigNumber(totalQuantityAsked), transactions: [] }));

export default takeMultipleOrders;
