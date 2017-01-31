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
  collections.sync(
    (err, result) => {
      if (!err) {
        offers = result;
        console.log(offers);
        done();
      } else {
        console.log(err);
      }
    }
  );
}

Meteor.methods({
  'offers.sync': () => {
    collections.sync(
      (err, result) => {
        if (!err) {
          // TODO store in Offers collection
          offers = result;
          console.log(offers);
          done();
        } else {
          console.log(err);
        }
      }
    );
  },
});
