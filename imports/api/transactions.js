import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import contract from 'truffle-contract';
import VaultJson from '@melonproject/protocol/build/contracts/Vault.json';

import web3 from '/imports/lib/web3';
import addressList from '/imports/melon/interface/addressList';
import specs from '/imports/melon/interface/helpers/specs';

import Vaults from '/imports/api/vaults';

// CONSTANTS
const blocksPerDay = 21600;

// COLLECTIONS

const Transactions = new Mongo.Collection('transactions');

if (Meteor.isServer) {
  Meteor.publish('transactions', (manager) => {
    check(manager, String);
    return Transactions.find({
      manager,
    }, {
      sort: {
        blockTimestamp: -1,
      },
    });
  });
}

// COLLECTION METHODS
const vaults = Vaults.find({}).fetch();

Transactions.watch = (vaults) => {
  if (Meteor.isClient) return;

  const Vault = contract(VaultJson);
  Vault.setProvider(web3.currentProvider);
  for (let i = 0; i < vaults.length; i++) {
    const coreContract = Vault.at(vaults[i].address); // TODO: define fund address (from URL)

    const transactions = coreContract.SharesCreated({}, {
      fromBlock: web3.eth.blockNumber,
      toBlock: 'latest',
    });

    transactions.watch(Meteor.bindEnvironment((err, event) => {
      console.log('TRANSACTION --------------------------------', event);
      // if(err) throw err;

      // const {
      //   byParticipant: manager,
      //   atTimestamp: timeStamp,
      //   numShares: numCreatedShares,
      // } = event.args;

      // Transactions.upsert({
      //   //TODO: check sharesCreated event shape
      //   id}, {
      //     manager,
      //     timeStamp,
      //     numShares,
      //     FUNDADDRESS
      //   });
    }));
  }
};

export default Transactions;

// //CONSTANTS
// const blocksPerDay = 21600;

// //COLLECTIONS

// const Transactions = new Mongo.Collection('Transactions');
// if (Meteor.isServer) {
//   Meteor.publish('transactions', MANAGERADDRESS) => Transactions.find({ //TODO: define manager address (from Metamask)
//     manager: MANAGERADDRESS,
//   },
//   {
//     sort: {
//       blockTimestamp: -1,
//     }
//   })
// }

// Transactions.watch = () => {
//   if(Meteor.isClient) return;

//   const Vault = contract(VaultJson);
//   Vault.setProvider(web3.currentProvider);
//   const coreContract = Vault.at(FUNDADDRESS); //TODO: define fund address (from URL)

//   const transactions = coreContract.SharesCreated({}, {
//     fromBlock: web3.eth.blockNumber,
//     toBlock: 'latest',
//   });

//   transactions.watch(Meteor.bindEnvironment((err, event) => {
//     console.log(event);
//     if(err) throw err;

//     const {
//       byParticipant: manager,
//       atTimestamp: timeStamp,
//       numShares: numCreatedShares,
//     } = event.args;

//     // Transactions.upsert({
//     //   //TODO: check sharesCreated event shape
//     //   id}, {
//     //     manager,
//     //     timeStamp,
//     //     numShares,
//     //     FUNDADDRESS
//     //   });
//   }));
// };

// export default Transactions;

//  // event SharesCreated(address indexed byParticipant, uint atTimestamp, uint numShares); // Participation
