import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// SMART-CONTRACT IMPORT

import constants from '/imports/lib/assets/utils/constants.js';
import functions from '/imports/lib/assets/utils/functions.js';
import collections from '/imports/lib/assets/utils/collections.js';
import contract from 'truffle-contract';
import PreminedAssetJson from '/imports/lib/assets/contracts/PreminedAsset.json'; // Get Smart Contract JSON
import ExchangeJson from '/imports/lib/assets/contracts/Exchange.json';
const PreminedAsset = contract(PreminedAssetJson); // Set Provider
PreminedAsset.setProvider(web3.currentProvider);
const Exchange = contract(ExchangeJson);
Exchange.setProvider(web3.currentProvider);
const KOVAN_NETWORK_ID = 42; // TODO persistent network id
// const exchangeContract = Exchange.at(Exchange.networks[KOVAN_NETWORK_ID].address); // Initialize contract instance
const exchangeContract = Exchange.at('0x442Fd95C32162F914364C5fEFf27A0Dc05214706'); // Initialize contract instance

// COLLECTIONS

export const Orders = new Mongo.Collection('orders');
if (Meteor.isServer) { Meteor.publish('orders', () => Orders.find({}, { sort: { id: -1 } })); } // Publish Collection

let orders = [];  // Orders collections


if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('orders', () => Orders.find({}, { sort: { id: -1 } }));

  // // TODO differently
  // collections.sync(
  //   (err, result) => {
  //     if (!err) {
  //       orders = result;
  //       for (let index = 0; index < orders.length; index += 1) {
  //         console.log(`Index: ${index}`);
  //         console.log(`Ask Price: ${orders[index].ask_price}`);
  //         const order = orders[index];
  //         // TODO order is Orders.order
  //         const res = Orders.update(
  //           { id: index },
  //           { $set: {
  //             order,
  //             createdAt: new Date(),
  //           },
  //           }, {
  //             upsert: true,
  //           });
  //         console.log(`Orders update res: ${res}`);
  //       }
  //     } else {
  //       console.log(err);
  //     }
  //   }
  // );
}

Meteor.methods({
  'orders.sync': () => {
    // // TODO clean up
    // collections.sync(
    //   (err, result) => {
    //     if (!err) {
    //       // TODO store in Orders collection
    //       orders = result;
    //       for (let index = 0; index < orders.length; index += 1) {
    //         console.log(`Ask Price: ${orders[index].ask_price}`);
    //         Orders.update(
    //           { id: index },
    //           { $set: {
    //             ask_price: orders[index].ask_price,
    //             createdAt: new Date(),
    //           },
    //           }, {
    //             upsert: true,
    //           });
    //         }
    //     } else {
    //       console.log(err);
    //     }
    //   }
    // );
  },
});
