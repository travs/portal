import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
// SMART-CONTRACT IMPORT
import contract from 'truffle-contract';
import ExchangeJson from '@melonproject/protocol/build/contracts/Exchange.json';

import web3 from '/imports/lib/web3';
import addressList from '/imports/melon/interface/addressList';
import getOrder from '/imports/melon/interface/getOrder';
import serializeOrder from '/imports/melon/interface/helpers/serializeOrder';

const NUMBERS_OF_ORDERS_TO_SYNC_ON_STARTUP = 96;

// COLLECTIONS
const Orders = (global.Orders = new Mongo.Collection('orders'));

if (Meteor.isServer) {
  // Note: you need to specify an asset pair. There is no way to get all orders to the client.
  Meteor.publish('orders', (currentAssetPair = '---/---') => {
    check(currentAssetPair, String);
    const [baseTokenSymbol, quoteTokenSymbol] = currentAssetPair.split('/');

    return Orders.find(
      {
        isActive: true,
        'buy.symbol': { $in: [baseTokenSymbol, quoteTokenSymbol] },
        'sell.symbol': { $in: [baseTokenSymbol, quoteTokenSymbol] },
      },
      { sort: { id: -1 } },
    );
  });
}

// COLLECTION METHODS

Orders.watch = () => {
  const Exchange = contract(ExchangeJson);
  Exchange.setProvider(web3.currentProvider);
  const exchangeContract = Exchange.at(addressList.exchange); // Initialize contract instance

  const orders = exchangeContract.OrderUpdate(
    {},
    {
      fromBlock: web3.eth.blockNumber,
      toBlock: 'latest',
    },
  );

  orders.watch(
    Meteor.bindEnvironment((err, event) => {
      if (err) throw err;

      console.log('Order updated', event.args.id.toNumber());

      Orders.syncOrderById(event.args.id.toNumber());
    }),
  );
};

Orders.sync = () => {
  const Exchange = contract(ExchangeJson);
  Exchange.setProvider(web3.currentProvider);
  const exchangeContract = Exchange.at(addressList.exchange);

  exchangeContract.getLastOrderId().then((lastId) => {
    const endIndex = lastId
      .minus(NUMBERS_OF_ORDERS_TO_SYNC_ON_STARTUP)
      .toNumber();

    for (let id = lastId.toNumber(); id > endIndex; id -= 1) {
      Orders.syncOrderById(id);
    }
  });
};

Orders.syncOrderById = (id) => {
  getOrder(id)
    .then((order) => {
      if (order.sell.token !== '0x0000000000000000000000000000000000000000') {
        console.log('syncOrder with DB', order.id);
      }

      if (order.isActive) {
        Orders.upsert(
          {
            id: order.id,
          },
          {
            ...serializeOrder(order),
            createdAt: new Date(),
          },
        );
      } else {
        Orders.remove({ id: order.id });
      }
    })
    .catch((err) => {
      throw err;
    });
};

// METEOR METHODS

Meteor.methods({
  'orders.sync': () => {
    // only sync orders on the server to avoid sync-race-conditions
    if (Meteor.isServer) Orders.sync();
  },
  'orders.syncOrderById': (id) => {
    check(id, Number);
    if (Meteor.isServer) Orders.syncOrderById(id);
  },
});

export default Orders;
