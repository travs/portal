import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
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
if (Meteor.isServer) { Meteor.publish('orders', () => Orders.find({}, { sort: { id: -1 } })); } // Publish Collection

// COLLECTION METHODS

Orders.sync = () => {
  let numberOfOrdersCreated;
  exchangeContract.getLastOrderId().then((result) => {
    numberOfOrdersCreated = result.toNumber();
    for (let id = 1; id < numberOfOrdersCreated + 1; id += 1) {
      Orders.syncOrderById(id);
    }
  });
};

Orders.syncOrderById = (id) => {
  exchangeContract.orders(id).then((order) => {
    const [sellHowMuch, sellWhichToken, buyHowMuch, buyWhichToken, owner, isActive] = order;
    const buyPrecision = specs.getTokenPrecisionByAddress(buyWhichToken);
    const sellPrecision = specs.getTokenPrecisionByAddress(sellWhichToken);
    const buySymbol = specs.getTokenSymbolByAddress(buyWhichToken);
    const sellSymbol = specs.getTokenSymbolByAddress(sellWhichToken);
    const sellPrice = buyHowMuch / sellHowMuch * Math.pow(10, sellPrecision - buyPrecision);
    const buyPrice = sellHowMuch / buyHowMuch * Math.pow(10, buyPrecision - sellPrecision);
    // Insert into Orders collection
    Orders.update(
      { id },
      { $set: {
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
        createdAt: new Date(),
      },
      }, {
        upsert: true,
      });
  });
};

// METEOR METHODS

Meteor.methods({
  'orders.sync': () => {
    Orders.sync();
  },
  'orders.upsert': (orderId) => {
    Orders.syncOrderById(orderId);
  },
});
