import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import contract from 'truffle-contract';

import web3 from '/imports/lib/web3';

// SMART-CONTRACT IMPORT
import addressList from '/imports/melon/interface/addressList';
import VersionJson from '/imports/melon/contracts/Version.json';
import CoreJson from '/imports/melon/contracts/Core.json';

const Version = contract(VersionJson);
const Core = contract(CoreJson);

// COLLECTIONS

const Cores = new Mongo.Collection('cores');
if (Meteor.isServer) { Meteor.publish('cores', () => Cores.find()); } // Publish Collection

// COLLECTION METHODS

Cores.watch = () => {
  // Creation of contract object
  Version.setProvider(web3.currentProvider);
  const versionContract = Version.at(addressList.version);

  const cores = versionContract.CoreUpdate({}, {
    fromBlock: web3.eth.blockNumber,
    toBlock: 'latest',
  });

  cores.watch(Meteor.bindEnvironment((err, event) => {
    if (err) throw err;

    console.log(`Cores.watch ${event.args.id}`);
    Cores.syncCoreById(event.args.id.toNumber()); // see event object, doesnt have .id
  }));
};

Cores.sync = () => {
  Version.setProvider(web3.currentProvider);
  const versionContract = Version.at(addressList.version);

  versionContract.getLastCoreId().then((lastId) => {
    for (let id = 1; id < lastId.toNumber() + 1; id += 1) {
      Cores.syncCoreById(id);
    }
  });
};

Cores.syncCoreById = (id) => {
  Core.setProvider(web3.currentProvider);
  Version.setProvider(web3.currentProvider);
  const versionContract = Version.at(addressList.version);

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
  let sharePrice;

  // Temp
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
    return coreContract.performCalculations();
  })
  .then((calculations) => {
    // [gav, managementFee, performanceFee, unclaimedFees, nav, sharePrice] = calculations;
    nav = calculations[4];
    sharePrice = calculations[5];
    return coreContract.totalSupply();
  })
  .then((result) => {
    currTotalSupply = result;
    // sharePrice = convertToTokenPrecision(sharePrice, decimals);
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
      sharePrice: sharePrice.toNumber(),
      sharesSupply: currTotalSupply.toNumber(),
      // atTimestamp: atTimestamp.toNumber(), TODO ASK RETO
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


export default Cores;
