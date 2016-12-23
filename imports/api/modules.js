import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
// Smart contracts
import Registrar from '/imports/lib/assets/contracts/Registrar.sol.js';
import PreminedToken from '/imports/lib/assets/contracts/PreminedToken.sol.js';

const Registrars = new Mongo.Collection('registrars');

if (Meteor.isServer) {
  Meteor.publish('registrars', () => Registrars.find());
}


Meteor.methods({
  'registrars.insert'(address) {
    check(address, String);

    Registrar.setProvider(web3.currentProvider);
    PreminedToken.setProvider(web3.currentProvider);

    const registrarContract = Registrar.at(address);

    registrarContract.numAssignedAssets()
    .then((res) => {
      const numAssignedAssets = res.toNumber();

      for (let i = 0; i < numAssignedAssets; i += 1) {
        let erc20Contract;
        let priceFeed;
        let exchange;
        let name;
        let symbol;
        let precision;
        registrarContract.assetAt(i).then((result) => {
          erc20Contract = PreminedToken.at(result);
          return erc20Contract.name();
        })
        .then((result) => {
          name = result;
          return erc20Contract.symbol();
        })
        .then((result) => {
          symbol = result;
          return erc20Contract.precision();
        })
        .then((result) => {
          precision = result.toNumber();
          Registrars.insert({
            index: i,
            name,
            symbol,
            precision,
            createdAt: new Date(),
          });
        });
      }
    });
  },
});

export { Registrars };
