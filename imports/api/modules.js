import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
// Smart contracts
import Registrar from '/imports/lib/assets/contracts/Registrar.sol.js';
import PreminedAsset from '/imports/lib/assets/contracts/PreminedAsset.sol.js';
import PriceFeed from '/imports/lib/assets/contracts/PriceFeed.sol.js';

const Registrars = new Mongo.Collection('registrars');

if (Meteor.isServer) {
  Meteor.publish('registrars', () => Registrars.find({}, { sort: { createdAt: -1 } }));
}


Meteor.methods({
  'registrars.insert'(registrarAddress, portfolioAddress, managerAddress) {
    check(registrarAddress, String);
    check(portfolioAddress, String);
    check(managerAddress, String);

    Registrar.setProvider(web3.currentProvider);
    const registrarContract = Registrar.at(registrarAddress);
    PreminedAsset.setProvider(web3.currentProvider);
    PriceFeed.setProvider(web3.currentProvider);

    registrarContract.numAssignedAssets()
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
          return registrarContract.priceFeedsAt(index);
        })
        .then((result) => {
          priceFeedAddress = result;
          return registrarContract.exchangesAt(index);
        })
        .then((result) => {
          exchangeAddress = result;
          const resRegistrarUpsert = Registrars.update(
            { address: registrarAddress },
            { $set: {
              address: registrarAddress,
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
          if (resRegistrarUpsert === false) {
            console.log(`Error in Registrar upsert: ${resRegistrarUpsert}`);
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
          //   console.log(`Error in Registrar upsert: ${resAssetsUpsert}`);
          // }
        });
      }
    });
  },
});

// export { Registrars, Assets };
export { Registrars };
