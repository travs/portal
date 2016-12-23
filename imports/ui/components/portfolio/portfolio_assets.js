import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
// Smart contracts
import Registrar from '/imports/lib/assets/contracts/Registrar.sol.js';
import PreminedToken from '/imports/lib/assets/contracts/PreminedToken.sol.js';
// Corresponding html file
import './portfolio_assets.html';

import { Portfolios } from '/imports/api/portfolios.js';
import { Registrars } from '/imports/api/modules';






Template.portfolio_assets.onCreated(() => {

  Meteor.subscribe('assets');
  Meteor.subscribe('portfolios');


  Registrar.setProvider(web3.currentProvider);
  PreminedToken.setProvider(web3.currentProvider);

  const registrarContract = Registrar.at(Session.get('registrarContractAddress'));

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
        precision = result;
        // Assets.insert({
        //   index: i,
        //   name,
        //   symbol,
        //   precision,
        //   createdAt: new Date(),
        // });
      });
    }
  });
});


Template.portfolio_assets.helpers({
  assetList() {
    return [];
  },
});


Template.portfolio_assets.onRendered(() => {});


Template.portfolio_assets.events({});
