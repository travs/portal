import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

// SMART-CONTRACT IMPORT

import contract from 'truffle-contract';
import UniverseJson from '/imports/lib/assets/contracts/Universe.json'; // Get Smart Contract JSON
const Universe = contract(UniverseJson); // Set Provider
Universe.setProvider(web3.currentProvider);
import PreminedAssetJson from '/imports/lib/assets/contracts/PreminedAsset.json'; // Get Smart Contract JSON
const PreminedAsset = contract(PreminedAssetJson); // Set Provider
PreminedAsset.setProvider(web3.currentProvider);
import PriceFeedJson from '/imports/lib/assets/contracts/PriceFeed.json'; // Get Smart Contract JSON
const PriceFeed = contract(PriceFeedJson); // Set Provider
PriceFeed.setProvider(web3.currentProvider);

// COLLECTIONS

export const Universes = new Mongo.Collection('universes');
if (Meteor.isServer) { Meteor.publish('universes', () => Universes.find({}, { sort: { createdAt: -1 } })); }

// METHODS

Meteor.methods({
  'universes.insert'(universeAddress, portfolioAddress, managerAddress) {
    check(universeAddress, String);
    check(portfolioAddress, String);
    check(managerAddress, String);

    Universe.setProvider(web3.currentProvider);
    const universeContract = Universe.at(universeAddress);
    PreminedAsset.setProvider(web3.currentProvider);
    PriceFeed.setProvider(web3.currentProvider);

    universeContract.numAssignedAssets()
    .then((res) => {
      const numAssignedAssets = res.toNumber();
      for (let index = 0; index < numAssignedAssets; index += 1) {
        let assetContract;
        let assetAddress;
        let assetName;
        let assetSymbol;
        let assetPrecision;
        let priceFeedAddress;
        let exchangeAddress;
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
          return universeContract.priceFeedsAt(index);
        })
        .then((result) => {
          priceFeedAddress = result;
          return universeContract.exchangesAt(index);
        })
        .then((result) => {
          exchangeAddress = result;
          const resUniverseUpsert = Universes.update(
            { address: universeAddress },
            { $set: {
              address: universeAddress,
              index,
              assets: {
                address: assetAddress,
                name: assetName,
                symbol: assetSymbol,
                precision: assetPrecision,
              },
              priceFeeds: {
                address: priceFeedAddress,
              },
              exchanges: {
                address: exchangeAddress,
              },
              createdAt: new Date(),
            },
            }, {
              upsert: true,
            }
          );
          if (resUniverseUpsert === false) {
            console.log(`Error in Universe upsert: ${resUniverseUpsert}`);
          }
          // TODO
          // const resAssetsUpsert = Assets.update(
          //   { address: assetAddress },
          //   { $set: {
          //     address: assetAddress,
          //     name: assetName,
          //     symbol: assetSymbol,
          //     precision: assetPrecision,
          //     priceFeed: {
          //       address: priceFeedAddress,
          //       precision: priceFeedPrecision,
          //     },
          //     createdAt: new Date(),
          //   },
          //   }, {
          //     upsert: true,
          //   }
          // );
          // if (resAssetsUpsert === false) {
          //   console.log(`Error in Universe upsert: ${resAssetsUpsert}`);
          // }
        });
      }
    });
  },
});
