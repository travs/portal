import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import AddressList from '/imports/lib/ethereum/address_list';
import specs from '/imports/lib/assets/utils/specs.js';

// SMART-CONTRACT IMPORT

import constants from '/imports/lib/assets/utils/constants.js';
import functions from '/imports/lib/assets/utils/functions.js';
import collections from '/imports/lib/assets/utils/collections.js';
import contract from 'truffle-contract';
import PreminedAssetJson from '/imports/lib/assets/contracts/PreminedAsset.json'; // Get Smart Contract JSON
import ExchangeJson from '/imports/lib/assets/contracts/Exchange.json';
const PreminedAsset = contract(PreminedAssetJson); // Set Provider
const Exchange = contract(ExchangeJson);
PreminedAsset.setProvider(web3.currentProvider);
Exchange.setProvider(web3.currentProvider);
const exchangeContract = Exchange.at(AddressList.Exchange); // Initialize contract instance

// COLLECTIONS
export const Orders = new Mongo.Collection('orders');
if (Meteor.isServer) {
  // Note: you need to specify an asset pair. There is no way to get all orders to the client.
  Meteor.publish('orders', (currentAssetPair = '---/---') => {
    check(currentAssetPair, String);
    const [baseTokenSymbol, quoteTokenSymbol] = currentAssetPair.split('/');

    return Orders.find({
      isActive: true,
      'buy.symbol': { $in: [baseTokenSymbol, quoteTokenSymbol] },
      'sell.symbol': { $in: [baseTokenSymbol, quoteTokenSymbol] },
    }, { sort: { id: -1 } });
  });
}

// COLLECTION METHODS

Orders.watch = () => {
  const orders = exchangeContract.OrderUpdate({}, {
    fromBlock: web3.eth.blockNumber,
    toBlock: 'latest',
  });

  orders.watch(Meteor.bindEnvironment((err, event) => {
    if (err) throw err;

    Orders.syncOrderById(event.args.id.toNumber());
  }));
};


Orders.sync = () => {
  exchangeContract.getLastOrderId().then((lastId) => {
    for (let id = 1; id < lastId.toNumber() + 1; id += 1) {
      Orders.syncOrderById(id);
    }
  });
};


Orders.syncOrderById = (id) => {
  exchangeContract.orders(id).then((info) => {
    console.log(info);
    const [sellHowMuch, sellWhichToken, buyHowMuch, buyWhichToken, timestamp, owner, isActive] = info; // TODO for new exchange version add _timestamp_
    const buyPrecision = specs.getTokenPrecisionByAddress(buyWhichToken);
    const sellPrecision = specs.getTokenPrecisionByAddress(sellWhichToken);
    const buySymbol = specs.getTokenSymbolByAddress(buyWhichToken);
    const sellSymbol = specs.getTokenSymbolByAddress(sellWhichToken);
    const sellPrice = buyHowMuch / sellHowMuch * Math.pow(10, sellPrecision - buyPrecision);
    const buyPrice = sellHowMuch / buyHowMuch * Math.pow(10, buyPrecision - sellPrecision);
    // Insert into Orders collection
    Orders.upsert({
      id,
    }, {
      id,
      owner,
      isActive,
      buy: {
        token: buyWhichToken,
        symbol: buySymbol,
        howMuch: buyHowMuch.toNumber(),
        precision: buyPrecision,
        price: buyPrice,
      },
      sell: {
        token: sellWhichToken,
        symbol: sellSymbol,
        howMuch: sellHowMuch.toNumber(),
        precision: sellPrecision,
        price: sellPrice,
      },
      timestamp,
      createdAt: new Date(),
    });
  });
};

// METEOR METHODS

Meteor.methods({
  'orders.sync': () => {
    Orders.sync();
  },
  'orders.syncOrderById': (id) => {
    check(id, Number);
    Orders.syncOrderById(id);
  },
});
