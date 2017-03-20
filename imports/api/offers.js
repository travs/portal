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
const exchangeContract = Exchange.at(Exchange.networks[KOVAN_NETWORK_ID].address); // Initialize contract instance

// COLLECTIONS

export const Offers = new Mongo.Collection('offers');
if (Meteor.isServer) { Meteor.publish('offers', () => Offers.find({}, { sort: { id: -1 } })); } // Publish Collection

let offers = [];  // Offers collections


if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('offers', () => Offers.find({}, { sort: { id: -1 } }));

  // TODO differently
  collections.sync(
    (err, result) => {
      if (!err) {
        offers = result;
        for (let index = 0; index < offers.length; index += 1) {
          console.log(`Index: ${index}`);
          console.log(`Ask Price: ${offers[index].ask_price}`);
          const offer = offers[index];
          // TODO offer is Offers.offer
          const res = Offers.update(
            { id: index },
            { $set: {
              offer,
              createdAt: new Date(),
            },
            }, {
              upsert: true,
            });
          console.log(`Offers update res: ${res}`);
        }
      } else {
        console.log(err);
      }
    }
  );
}

Meteor.methods({
  'offers.sync': () => {
    // TODO clean up
    collections.sync(
      (err, result) => {
        if (!err) {
          // TODO store in Offers collection
          offers = result;
          for (let index = 0; index < offers.length; index += 1) {
            console.log(`Ask Price: ${offers[index].ask_price}`);
            Offers.update(
              { id: index },
              { $set: {
                ask_price: offers[index].ask_price,
                createdAt: new Date(),
              },
              }, {
                upsert: true,
              });
            }
        } else {
          console.log(err);
        }
      }
    );
  },
});
