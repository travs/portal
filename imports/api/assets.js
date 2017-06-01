import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import addressList from '/imports/melon/interface/addressList.js';

// SMART-CONTRACT IMPORT

import contract from 'truffle-contract';
import UniverseJson from '/imports/melon/contracts/Universe.json'; // Get Smart Contract JSON
import PreminedAssetJson from '/imports/melon/contracts/PreminedAsset.json';
import PriceFeedJson from '/imports/melon/contracts/PriceFeed.json';
const Universe = contract(UniverseJson); // Set Provider
Universe.setProvider(web3.currentProvider);
const PreminedAsset = contract(PreminedAssetJson);
PreminedAsset.setProvider(web3.currentProvider);
const PriceFeed = contract(PriceFeedJson);
PriceFeed.setProvider(web3.currentProvider);


// COLLECTIONS

export const Assets = new Mongo.Collection('assets');
if (Meteor.isServer) { Meteor.publish('assets', () => Assets.find({}, { sort: { price: -1 } })); } // Publish Collection

// METHODS

Meteor.methods({
  'assets.sync': (assetHolderAddress) => {
    check(assetHolderAddress, String);

    // TODO get Universe address via Core.getUniverseAddress
    const universeContract = Universe.at(addressList.universe); // Initialize contract instance

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
          return assetContract.decimals();
        })
        .then((result) => {
          assetPrecision = result.toNumber();
          return assetContract.balanceOf(assetHolderAddress);
        })
        .then((result) => {
          assetHoldings = result.toNumber();
          return universeContract.priceFeedAt(index);
        })
        .then((result) => {
          priceFeedAddress = result;
          priceFeedContract = PriceFeed.at(priceFeedAddress);
          return priceFeedContract.getData(assetAddress); // Result [Timestamp, Price]
        })
        .then((result) => {
          const timestampOfLastUpdate = result[0].toNumber();
          const currentPrice = (assetSymbol === 'ETH-T') ? Math.pow(10, assetPrecision) : result[1].toNumber();
          Assets.update(
            { address: assetAddress, holder: assetHolderAddress },
            { $set: {
              name: assetName,
              symbol: assetSymbol,
              precision: assetPrecision,
              holdings: assetHoldings,
              priceFeed: {
                address: priceFeedAddress,
                price: currentPrice,
                timestamp: timestampOfLastUpdate,
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
