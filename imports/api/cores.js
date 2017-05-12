import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import AddressList from '/imports/lib/ethereum/address_list.js';
import specs from '/imports/lib/assets/utils/specs.js';
import { convertFromTokenPrecision, convertTo18Precision } from '/imports/lib/assets/utils/functions.js';


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
    fromBlock: web3.eth.blockNumber,
    toBlock: 'latest',
  });

  cores.watch(Meteor.bindEnvironment((err, event) => {
    if (err) throw err;

    console.log(`Cores.watch ${event.args.id}`)
    Cores.syncCoreById(event.args.id.toNumber()); //see event object, doesnt have .id
  }));
};

Cores.sync = () => {
  versionContract.getLastCoreId().then((lastId) => {
    for (let id = 1; id < lastId.toNumber() + 1; id += 1) {
      Cores.syncCoreById(id);
    }
  });
};

Cores.syncCoreById = (id) => {
  let coreContract;
  // Description of Core
  let address;
  let owner;
  let name;
  let symbol;
  let decimals;
  let isActive;
  // Properties of Core
  let universeAddress;
  let referenceAsset;
  // Calculation of Core
  let nav;
  let delta;
  let sharePrice;
  let sharesSupply;
  let atTimestamp;

  // Temp
  let currGav;
  let currTotalSupply;

  // Get description values of Core
  versionContract.cores(id).then((info) => {
    [address, owner, name, symbol, decimals, isActive] = info;
    coreContract = Core.at(address);
    return coreContract.getUniverseAddress();
  })
  .then((result) => {
    universeAddress = result;
    return coreContract.getReferenceAsset();
  })
  .then((result) => {
    referenceAsset = result;
    return coreContract.getLastCalculations();
  })
  .then((calculations) => {
    [nav, delta, sharePrice, sharesSupply, atTimestamp] = calculations;
    return coreContract.calcGAV();
  })
  .then((result) => {
    currGav = result;
    return coreContract.totalSupply();
  })
  .then((result) => {
    currTotalSupply = result;
    // Insert into Portfolio collection
    Cores.upsert({
      id,
    }, {
      id,
      address,
      owner,
      name,
      symbol,
      decimals: decimals.toNumber(),
      isActive,
      universeAddress,
      referenceAsset,
      nav: nav.toNumber(),
      delta: delta.toNumber(),
      sharePrice: currGav.toNumber() / currTotalSupply.toNumber(), // TODO sharePrice by NAV value
      sharesSupply: currTotalSupply.toNumber(),
      atTimestamp: atTimestamp.toNumber(),
      createdAt: new Date(),
    });
  });
};

// METEOR METHODS

Meteor.methods({
  'cores.setToUsed': (_id) => {
    check(_id, String);
    Cores.update(_id, { $set: { isUsed: true } });
  },
  'cores.sync': () => {
    Cores.sync();
  },
  'cores.syncCoreByAddress': (ofCore) => {
    check(ofCore, String);
    Cores.syncCoreByAddress(ofCore);
  },
  'cores.syncCoreById': (id) => {
    check(id, Number);
    Cores.syncCoreById(id);
  },
  'cores.removeById': (id) => {
    check(id, Number);
    // TODO Only the owner can delete it
    // if (portfolio.owner !== Meteor.userId())
    //   throw new Meteor.Error('not-authorized');
    Cores.remove(id);
  },
});
