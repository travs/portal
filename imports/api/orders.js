import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import AddressList from '/imports/lib/ethereum/address_list.js'

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
    for (let index = 0; index < numberOfOrdersCreated; index += 1) {
      exchangeContract.orders(index).then((order) => {
        let [sellHowMuch, sellWhichToken, buyHowMuch, buyWhichToken, owner, isActive] = order;
        // Insert into Orders collection
        Orders.update(
          { id: index },
          { $set: {
            index,
            owner,
            isActive,
            buyHowMuch: buyHowMuch.toNumber(),
            buyWhichToken,
            sellHowMuch: sellHowMuch.toNumber(),
            sellWhichToken,
            buyPrice: buyHowMuch / sellHowMuch,
            sellPrice: sellHowMuch / buyHowMuch,
            createdAt: new Date(),
          },
          }, {
            upsert: true,
          });
      });
    }
  });
};

// METEOR METHODS

Meteor.methods({
  'orders.sync': () => {
    Orders.sync();
  },
});
