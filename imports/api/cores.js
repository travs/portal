import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import AddressList from '/imports/lib/ethereum/address_list.js';
import specs from '/imports/lib/assets/utils/specs.js';
import { convertFromTokenPrecision } from '/imports/lib/assets/utils/functions.js';


// SMART-CONTRACT IMPORT

import contract from 'truffle-contract';
import VersionJson from '/imports/lib/assets/contracts/Version.json';
import CoreJson from '/imports/lib/assets/contracts/Core.json';
const Version = contract(VersionJson);
const Core = contract(CoreJson);
// Creation of contract object
Version.setProvider(web3.currentProvider);
Core.setProvider(web3.currentProvider);
const versionContract = Version.at(AddressList.Version);

// COLLECTIONS

export const Cores = new Mongo.Collection('cores');
if (Meteor.isServer) { Meteor.publish('cores', () => Cores.find()); } // Publish Collection

// COLLECTION METHODS

Cores.watch = () => {
  const cores = versionContract.CoreUpdate({}, {
    fromBlock: 0,
    toBlock: 'latest',
  });

  cores.watch(Meteor.bindEnvironment((err, event) => {
    if (err) throw err;

    Cores.syncCoreById(event.args.id.toNumber()); //see event object, doesnt have .id
  }));
};

Cores.sync = () => {
  let numberOfCoresCreated;
  versionContract.numCreatedCores().then((res) => {
    numberOfCoresCreated = res.toNumber();
    for (let index = 0; index < numberOfCoresCreated; index += 1) {
      Cores.syncCoreById(index);
    }
  });
};

// TODO implement consistent w Orders
Cores.syncCoreById = (id) => {
    let coreContract;
    // List of inputs for core collection
    let address;
    let name;
    let managerAddress;
    let universeAddress;
    let nav;
    versionContract.cores(id).then((result) => {
      address = result;
      coreContract = Core.at(address);
      return coreContract.name();
    })
    .then((result) => {
      name = result;
      return coreContract.owner();
    })
    .then((result) => {
      managerAddress = result;
      return coreContract.calcNAV();
    })
    .then((result) => {
      console.log('result NAV', result)
      const tokenAddress = specs.getTokenAddress('ETH-T');
      const tokenPrecision = specs.getTokenPrecisionByAddress(tokenAddress);
      nav = convertFromTokenPrecision(result.toNumber(), tokenPrecision);
      console.log(nav);
      return coreContract.getUniverseAddress();
    })
    .then((result) => {
      universeAddress = result;
      // Insert into Portfolio collection
      Cores.update(
        { address },
        { $set: {
          address,
          id,
          name,
          managerAddress,
          universeAddress,
          sharePrice: web3.toWei(1.0, 'ether'),
          notional: nav,
          intraday: '±0.0',
          delta: '±0.0',
          username: 'N/A',
          createdAt: new Date(),
        },
        }, {
          upsert: true,
        });
    });
  // });
};

// METEOR METHODS

Meteor.methods({
  'cores.upsert': (address, name, managerAddress, universeAddress, sharePrice, notional, intraday) => {
    check(address, String);
    check(name, String);
    check(managerAddress, String);
    check(universeAddress, String);
    check(sharePrice, String);
    check(notional, Number);
    check(intraday, Number);

    Cores.update(
      { address },
      { $set: {
        address,
        name,
        managerAddress,
        universeAddress,
        sharePrice,
        notional,
        intraday: '±0.0',
        delta: '±0.0',
        username: 'N/A',
        createdAt: new Date(),
      },
      }, {
        upsert: true,
      });
  },
  'cores.setToUsed': (portfolioId) => {
    check(portfolioId, String);
    Cores.update(portfolioId, { $set: { isUsed: true } });
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
  'cores.reset': () => {
    // Cores.remove();
  },
});
