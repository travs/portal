import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

// SMART-CONTRACT IMPORT

import contract from 'truffle-contract';
import UniverseJson from '/imports/lib/assets/contracts/Universe.json'; // Get Smart Contract JSON
import PreminedAssetJson from '/imports/lib/assets/contracts/PreminedAsset.json';
import PriceFeedJson from '/imports/lib/assets/contracts/PriceFeed.json';
const Universe = contract(UniverseJson); // Set Provider
Universe.setProvider(web3.currentProvider);
const PreminedAsset = contract(PreminedAssetJson);
PreminedAsset.setProvider(web3.currentProvider);
const PriceFeed = contract(PriceFeedJson);
PriceFeed.setProvider(web3.currentProvider);
const KOVAN_NETWORK_ID = 42; //TODO persistent network id
const universeContract = Universe.at(Universe.networks[KOVAN_NETWORK_ID].address); // Initialize contract instance

// COLLECTIONS

export const Assets = new Mongo.Collection('assets');
if (Meteor.isServer) { Meteor.publish('assets', () => Assets.find({}, { sort: { price: -1 } })); } // Publish Collection

// METHODS

Meteor.methods({
  'assets.sync': (assetHolderAddress) => {
    check(assetHolderAddress, String);
    // TODO build function
    universeContract.numAssignedAssets().then((assignedAssets) => {
      const numAssignedAssets = assignedAssets.toNumber();
      for (let index = 0; index < numAssignedAssets; index += 1) {
        // TODO rem unnecessairy elements
        let assetContract;
        let assetAddress;
        let assetName;
        let assetSymbol;
        let assetPrecision;
        let assetHoldings;
        let priceFeedContract;
        let priceFeedAddress;
        let currentPrice;
        let lastUpdate;
        universeContract.assetAt(index).then((result) => {
          assetAddress = result;
          assetContract = PreminedAsset.at(assetAddress);
          return assetContract.name();
        })
        .then((result) => {
          assetName = result;
          return assetContract.symbol();
        })
        .then((result) => {
          assetSymbol = result;
          return assetContract.getDecimals();
        })
        .then((result) => {
          assetPrecision = result.toNumber();
          return assetContract.balanceOf(assetHolderAddress);
        })
        .then((result) => {
          assetHoldings = result.toNumber();
          return universeContract.priceFeedsAt(index);
        })
        .then((result) => {
          priceFeedAddress = result;
          priceFeedContract = PriceFeed.at(priceFeedAddress);
          return priceFeedContract.getPrice(assetAddress);
        })
        .then((result) => {
          currentPrice = result.toNumber();
          return priceFeedContract.lastUpdate();
        })
        .then((result) => {
          lastUpdate = result.toNumber();
          // console.log(`\n Current Price: ${currentPrice} @ ${lastUpdate}`)
          Assets.update(
            { address: assetAddress, assetHolderAddress },
            { $set: {
              address: assetAddress,
              name: assetName,
              symbol: assetSymbol,
              precision: assetPrecision,
              holder: assetHolderAddress,
              holdings: assetHoldings,
              priceFeed: {
                address: priceFeedAddress,
                price: currentPrice,
                timestamp: lastUpdate,
              },
              createdAt: new Date(),
            },
            }, {
              upsert: true,
            });
        });
      }
    });
  },
});
