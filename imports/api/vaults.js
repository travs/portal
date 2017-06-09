import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import contract from 'truffle-contract';

import web3 from '/imports/lib/web3';

// SMART-CONTRACT IMPORT
import addressList from '/imports/melon/interface/addressList';
import VersionJson from '/imports/melon/contracts/Version.json';
import VaultJson from '/imports/melon/contracts/Vault.json';

const Version = contract(VersionJson);
const Vault = contract(VaultJson);

// COLLECTIONS

const Vaults = new Mongo.Collection('vaults');
if (Meteor.isServer) { Meteor.publish('vaults', () => Vaults.find()); } // Publish Collection

// COLLECTION METHODS

Vaults.watch = () => {
  // Creation of contract object
  Version.setProvider(web3.currentProvider);
  const versionContract = Version.at(addressList.version);

  const vaults = versionContract.VaultUpdate({}, {
    fromBlock: web3.eth.blockNumber,
    toBlock: 'latest',
  });

  vaults.watch(Meteor.bindEnvironment((err, event) => {
    if (err) throw err;

    console.log(`Vaults.watch ${event.args.id}`);
    Vaults.syncVaultById(event.args.id.toNumber()); // see event object, doesnt have .id
  }));
};

Vaults.sync = () => {
  Version.setProvider(web3.currentProvider);
  const versionContract = Version.at(addressList.version);

  versionContract.getLastVaultId().then((lastId) => {
    for (let id = 1; id < lastId.toNumber() + 1; id += 1) {
      Vaults.syncVaultById(id);
    }
  });
};

Vaults.syncVaultById = (id) => {
  Vault.setProvider(web3.currentProvider);
  Version.setProvider(web3.currentProvider);
  const versionContract = Version.at(addressList.version);

  let coreContract;
  // Description of Vault
  let address;
  let owner;
  let name;
  let symbol;
  let decimals;
  let isActive;
  // Properties of Vault
  let universeAddress;
  let referenceAsset;
  // Calculation of Vault
  let nav;
  let sharePrice;

  // Temp
  let currTotalSupply;

  // Get description values of Vault
  versionContract.vaults(id).then((info) => {
    [address, owner, name, symbol, decimals, isActive] = info;
    coreContract = Vault.at(address);
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
    Vaults.upsert({
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
  'vaults.setToUsed': (_id) => {
    check(_id, String);
    if (Meteor.isServer) Vaults.update(_id, { $set: { isUsed: true } });
  },
  'vaults.sync': () => {
    if (Meteor.isServer) Vaults.sync();
  },
  'vaults.syncVaultByAddress': (ofVault) => {
    check(ofVault, String);
    if (Meteor.isServer) Vaults.syncVaultByAddress(ofVault);
  },
  'vaults.syncVaultById': (id) => {
    check(id, Number);
    if (Meteor.isServer) Vaults.syncVaultById(id);
  },
  'vaults.removeById': (id) => {
    check(id, Number);
    // TODO Only the owner can delete it
    // if (portfolio.owner !== Meteor.userId())
    //   throw new Meteor.Error('not-authorized');
    if (Meteor.isServer) Vaults.remove(id);
  },
});


export default Vaults;
