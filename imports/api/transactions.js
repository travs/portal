import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import contract from 'truffle-contract';
import VaultJson from '@melonproject/protocol/build/contracts/Vault.json';

import web3 from '/imports/lib/web3';
import addressList from '/imports/melon/interface/addressList';
import specs from '/imports/melon/interface/helpers/specs';

import Vaults from '/imports/api/vaults';

// COLLECTIONS

const Transactions = new Mongo.Collection('transactions');

if (Meteor.isServer) {
  Meteor.publish('transactions', (manager) => {
    check(manager, String);
    return Transactions.find(
      {
        manager,
      },
      {
        sort: {
          date: -1,
        },
      },
    );
  });
}

// COLLECTION METHODS
Transactions.watch = () => {
  if (Meteor.isClient) return;
  Vaults.find({}).observeChanges({
    added(id, vault) {
      const Vault = contract(VaultJson);
      Vault.setProvider(web3.currentProvider);
      const vaultContract = Vault.at(vault.address);

      // Share Creation Event
      const sharesCreated = vaultContract.SharesCreated(
        {},
        {
          fromBlock: 0,
          toBlock: 'latest',
        },
      );

      sharesCreated.watch(
        Meteor.bindEnvironment((err, event) => {
          if (err) throw err;

          const {
            byParticipant: manager,
            atTimestamp: timeStamp,
            numShares: numCreatedShares,
          } = event.args;

          console.log(
            'Share Creation Transaction Upsert ',
            event.transactionHash,
          );
          Transactions.upsert(
            {
              transactionHash: event.transactionHash,
            },
            {
              transactionType: event.event,
              vaultAddress: event.address,
              manager,
              amountOfShares: numCreatedShares.toString(),
              date: new Date(
                web3.eth.getBlock(event.blockNumber).timestamp * 1000,
              ),
              blockHash: event.blockHash,
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
              transactionIndex: event.transactionIndex,
              timeStamp,
            },
          );
        }),
      );

      // Share Annihilation Event
      const sharesAnnihilated = vaultContract.SharesAnnihilated(
        {},
        {
          fromBlock: 0,
          toBlock: 'latest',
        },
      );

      sharesAnnihilated.watch(
        Meteor.bindEnvironment((err, event) => {
          if (err) throw err;

          const {
            byParticipant: manager,
            atTimestamp: timeStamp,
            numShares: numAnnihilatedShares,
          } = event.args;

          console.log(
            'Share Annihilation Transaction Upsert ',
            event.transactionHash,
          );
          Transactions.upsert(
            {
              transactionHash: event.transactionHash,
            },
            {
              transactionType: event.event,
              vaultAddress: event.address,
              manager,
              amountOfShares: numAnnihilatedShares.toString(),
              date: new Date(
                web3.eth.getBlock(event.blockNumber).timestamp * 1000,
              ),
              blockHash: event.blockHash,
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
              transactionIndex: event.transactionIndex,
              timeStamp,
            },
          );
        }),
      );
    },
  });
};

// Rewards Converted
// const rewardsConverted = vaultContract.RewardsConverted(
//   {},
//   {
//     fromBlock: 0,
//     toBlock: 'latest',
//   },
// );

// rewardsConverted.watch(
//   Meteor.bindEnvironment((err, event) => {
//     if (err) throw err;

//     const {
//       atTimestamp: timeStamp,
//       numSharesConverted,
//       numUnclaimedFees,
//     } = event.args;

//     console.log(
//       'Rewards Converted Transaction Upsert ',
//       event.transactionHash,
//     );
//     Transactions.upsert(
//       {
//         transactionHash: event.transactionHash,
//       },
//       {
//         transactionType: event.event,
//         vaultAddress: event.address,
//         owner: event.owner,
//         numSharesConverted,
//         numUnclaimedFees,
//         blockHash: event.blockHash,
//         blockNumber: event.blockNumber,
//         transactionHash: event.transactionHash,
//         timeStamp,
//       },
//     );
//   }),
// );

// Rewards Payed Out
// const rewardsPayedOut = vaultContract.RewardsPayedOut(
//   {},
//   {
//     fromBlock: 0,
//     toBlock: 'latest',
//   },
// );

// rewardsPayedOut.watch(
//   Meteor.bindEnvironment((err, event) => {
//     if (err) throw err;

//     const {
//       byParticipant: manager,
//       atTimestamp: timeStamp,
//       numSharesPayedOut,
//     } = event.args;

//     console.log(
//       'Rewards Converted Transaction Upsert ',
//       event.transactionHash,
//     );
//     Transactions.upsert(
//       {
//         transactionHash: event.transactionHash,
//       },
//       {
//         transactionType: event.event,
//         vaultAddress: event.address,
//         owner: event.owner,
//         numSharesPayedOut,
//         atSharePrice: event.atSharePrice,
//         blockHash: event.blockHash,
//         blockNumber: event.blockNumber,
//         transactionHash: event.transactionHash,
//         timeStamp,
//       },
//     );
//   }),
// );
export default Transactions;

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

/* Share Annihilated Shape
{
  address: '0x947b7ac11e1e5d13d360bdf61cc4384ebcc389a3',
  blockHash: '0x82854916fe7dfa25c1c9324234cac28911a4a666f7723ef64807109420c6c4de',
  blockNumber: 2038670,
  logIndex: 4,
  transactionHash: '0xda153c689ecb95b26c14d0808dd704a595547e2a0383e935ac930cfad6ac1ad5',
  transactionIndex: 1,
  transactionLogIndex: '0x3',
  type: 'mined',
  event: 'SharesAnnihilated',
  args: {
    byParticipant: '0xc9982cd5a53b0e171813993109b7c8ea2690a67d',
    atTimestamp: { [String: '1497266980'] s: 1, e: 9, c: [Object] },
    numShares: {
      [String: '5000000000000000000'] s: 1, e: 18, c: [Object]
    }
  }
}
*/
