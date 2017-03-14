import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
// Smart contracts
import Universe from '/imports/lib/assets/contracts/Universe.json';
import PreminedAsset from '/imports/lib/assets/contracts/PreminedAsset.json';
import PriceFeed from '/imports/lib/assets/contracts/PriceFeed.json';

Universe.setProvider(web3.currentProvider);
PreminedAsset.setProvider(web3.currentProvider);
PriceFeed.setProvider(web3.currentProvider);
const universeContract = Universe.at(Universe.all_networks['3'].address);

// Collections
export const Assets = new Mongo.Collection('assets');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('assets', () => Assets.find({}, { sort: { price: -1 } }));
}

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
          return assetContract.precision();
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
