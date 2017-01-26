import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
// Collections
export const Assets = new Mongo.Collection('assets');
// Smart contracts
import Registrar from '/imports/lib/assets/contracts/Registrar.sol.js';
import PreminedAsset from '/imports/lib/assets/contracts/PreminedAsset.sol.js';
import PriceFeed from '/imports/lib/assets/contracts/PriceFeed.sol.js';

Registrar.setProvider(web3.currentProvider);
PreminedAsset.setProvider(web3.currentProvider);
PriceFeed.setProvider(web3.currentProvider);
const registrarContract = Registrar.at(Registrar.all_networks['3'].address);

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('assets', () => Assets.find({}, { sort: { price: -1 } }));
}

Meteor.methods({
  'assets.sync'(address) {
    check(address, String);
    // TODO build function
    registrarContract.numAssignedAssets().then((assignedAssets) => {
      const numAssignedAssets = assignedAssets.toNumber();
      for (let index = 0; index < numAssignedAssets; index += 1) {
        //TODO rem unnecessairy elements
        let assetContract;
        let assetAddress;
        let assetName;
        let assetSymbol;
        let assetPrecision;
        let assetHoldings;
        let priceFeedContract;
        let priceFeedAddress;
        let priceFeedPrecision;
        let currentPrice;
        let lastUpdate;
        registrarContract.assetAt(index).then((result) => {
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
          return assetContract.balanceOf(address);
        })
        .then((result) => {
          assetHoldings = result.toNumber();
          return registrarContract.priceFeedsAt(index);
        })
        .then((result) => {
          priceFeedAddress = result;
          priceFeedContract = PriceFeed.at(priceFeedAddress);
          return priceFeedContract.getPrecision();
        })
        .then((result) => {
          priceFeedPrecision = result.toNumber();
          return priceFeedContract.getPrice(assetAddress);
        })
        .then((result) => {
          currentPrice = result.toNumber();
          return priceFeedContract.lastUpdate();
        })
        .then((result) => {
          lastUpdate = result.toNumber();
          // console.log(`\n Current Price: ${currentPrice} @ ${lastUpdate}`)
          let res = Assets.update(
            { address: assetAddress },
            { $set: {
              address: assetAddress,
              name: assetName,
              symbol: assetSymbol,
              precision: assetPrecision,
              holdings: assetHoldings,
              priceFeed: {
                address: priceFeedAddress,
                precision: priceFeedPrecision,
                price: currentPrice,
                timestamp: lastUpdate,
              },
              createdAt: new Date(),
            }
          }, {
            upsert: true
          });
        });
      }
    });
  },
});
