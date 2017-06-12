import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

// SMART-CONTRACT IMPORT
import contract from 'truffle-contract';
import UniverseJson from '@melonproject/protocol/build/contracts/Universe.json'; // Get Smart Contract JSON
import PreminedAssetJson from '@melonproject/protocol/build/contracts/PreminedAsset.json';
import PriceFeedJson from '@melonproject/protocol/build/contracts/PriceFeed.json';

import web3 from '/imports/lib/web3';
import addressList from '/imports/melon/interface/addressList';


const Universe = contract(UniverseJson); // Set Provider
const PreminedAsset = contract(PreminedAssetJson);
const PriceFeed = contract(PriceFeedJson);

// COLLECTIONS

const Assets = new Mongo.Collection('assets');

if (Meteor.isServer) {
  Meteor.publish('assets', (holder) => {
    check(holder, String);
    return Assets.find({
      holder,
    }, {
      sort: {
        price: -1,
      },
    });
  });
}


// METHODS

Assets.sync = (assetHolderAddress) => {
  // TODO get Universe address via Vault.getUniverseAddress
  PreminedAsset.setProvider(web3.currentProvider);
  PriceFeed.setProvider(web3.currentProvider);
  Universe.setProvider(web3.currentProvider);
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
        Assets.update({ address: assetAddress, holder: assetHolderAddress }, {
          $set: {
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
};

Meteor.methods({
  'assets.sync': (assetHolderAddress) => {
    check(assetHolderAddress, String);

    // only the server should update the database
    if (Meteor.isServer) Assets.sync(assetHolderAddress);
  },
});


export default Assets;
