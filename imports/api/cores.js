import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

// SMART-CONTRACT IMPORT

import contract from 'truffle-contract';
import CoreJson from '/imports/lib/assets/contracts/Core.json'; // Get Smart Contract JSON
const Core = contract(CoreJson); // Set Provider
Core.setProvider(web3.currentProvider);

// COLLECTIONS

export const Cores = new Mongo.Collection('cores');
if (Meteor.isServer) { Meteor.publish('cores', () => Cores.find()); } // Publish Collection

// METHODS

Meteor.methods({
  'cores.insert': (address, name, managerAddress, managerEmail, universeAddress, sharePrice, notional, intraday) => {
    check(address, String);
    check(name, String);
    check(managerAddress, String);
    check(managerEmail, String);
    check(universeAddress, String);
    check(sharePrice, String);
    check(notional, Number);
    check(intraday, Number);

    Cores.insert({
      address,
      name,
      managerAddress,
      managerEmail,
      universeAddress,
      sharePrice,
      notional,
      intraday: '±0.0',
      isNew: true,
      delta: '±0.0',
      username: 'N/A',
      createdAt: new Date(),
    });
  },
  'cores.setToUsed': (portfolioId) => {
    check(portfolioId, String);
    Cores.update(portfolioId, { $set: { isNew: false } });
  },
  'cores.sync': (address) => {
    check(address, String);

    // Sync these parameters
    let notional;
    let sharePrice;
    const coreContract = Core.at(address);
    coreContract.totalSupply().then((result) => {
      notional = result.toNumber();
      //TODO getSharePrice is potentially outdated information; better to exectue calcSharePrice
      return coreContract.getSharePrice();
    })
    .then((result) => {
      sharePrice = result.toNumber();
      Cores.update(
        { address },
        { $set: {
          notional,
          sharePrice,
        } });
    });
  },
  'cores.remove': (portfolioId) => {
    check(portfolioId, String);
    // TODO Only the owner can delete it
    // if (portfolio.owner !== Meteor.userId())
    //   throw new Meteor.Error('not-authorized');
    Cores.remove(portfolioId);
  },
});
