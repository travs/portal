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
const vaults = Vaults.find().fetch();
// console.log('VAULTS --------------- ', vaults);

Transactions.watch = () => {
  if (Meteor.isClient) return;

  const Vault = contract(VaultJson);
  Vault.setProvider(web3.currentProvider);
  for (let i = 0; i < vaults.length; i++) {
    const coreContract = Vault.at(vaults[i].address);

    const transactions = coreContract.SharesCreated({}, {
      fromBlock: 0,
      toBlock: 'latest',
    });

    transactions.watch(Meteor.bindEnvironment((err, event) => {
      if (err) throw err;
      const {
        byParticipant: manager,
        atTimestamp: timeStamp,
        numShares: numCreatedShares,
      } = event.args;

      console.log('Share Creation Transaction Upsert ', event.transactionHash);
      Transactions.upsert({
        transactionHash: event.transactionHash,
      }, {
        address: event.address,
        blockHash: event.blockHash,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        eventType: event.event,
        manager,
        timeStamp,
        numCreatedShares,
      });
    }));
  }
};


/* Share Created Shape
{
  address: '0x3f5b3d05d9ead705f706fc60285b6c8e9d415258',
  blockHash: '0xb58af2eaf90b29c3f6cbc410c48864e5b2bfca29fd69cb82724f280d384810e1',
  blockNumber: 2190317,
  logIndex: 2,
  transactionHash: '0x9019e921dadaf2ddf0ac4d32302a3012c2d9580fab672952f2d291cbd1c7cdec',
  transactionIndex: 1,
  transactionLogIndex: '0x1',
  type: 'mined',
  event: 'SharesCreated',
  args: {
    byParticipant: '0xee2bb8598725445b532bdb14f522a99e04e84b38',
    atTimestamp: { [String: '1497949587'] s: 1, e: 9, c: [Object]
    },
    numShares: {
      [String: '10000000000000000000'] s: 1, e: 19, c: [Object]
    }
  }
}
*/

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
