import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
// Smart contracts
import EtherToken from '/imports/lib/assets/contracts/EtherToken.sol.js';
import BitcoinToken from '/imports/lib/assets/contracts/BitcoinToken.sol.js';
import RepToken from '/imports/lib/assets/contracts/RepToken.sol.js';
import EuroToken from '/imports/lib/assets/contracts/EuroToken.sol.js';
import PreminedAsset from '/imports/lib/assets/contracts/PreminedAsset.sol.js';
import Exchange from '/imports/lib/assets/contracts/Exchange.sol.js';
import constants from '/imports/lib/assets/utils/constants.js';
import functions from '/imports/lib/assets/utils/functions.js';
import collections from '/imports/lib/assets/utils/collections.js';

Exchange.setProvider(web3.currentProvider);
const exchangeContract = Exchange.at(Exchange.all_networks['3'].address);

export const Offers = new Mongo.Collection('offers');

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
