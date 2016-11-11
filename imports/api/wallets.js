import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Wallets = new Mongo.Collection('wallets');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('wallets', function walletsPublication() {
    return Wallets.find({ owner: this.userId });
  });
}

Meteor.methods({
  'wallets.insert'(address, randomSeed) {
    check(address, String);
    check(randomSeed, String);

    // Make sure the user is loggin in before inserting
    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Wallets.insert({
      open: true,
      address,
      balance: 0,
      nonce: 0,
      seed: randomSeed,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
    });
  },
  'wallets.remove'(walletId) {
    check(walletId, String);

    const wallet = Wallets.findOne(walletId);

    // Only the owner can delete it
    if (wallet.owner !== Meteor.userId())
      throw new Meteor.Error('not-authorized');

    Wallets.remove(walletId);
  },
  'wallets.updateBalance'(walletId, balance, nonce) {
    check(walletId, String);
    check(balance, Number);
    check(nonce, Number);

    const doc = Wallets.findOne(walletId);
    if (doc.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Wallets.update(walletId, { $set: { balance, nonce } });
  },
  'wallets.updateStatus'(walletId, status) {
    check(walletId, String);
    check(status, Boolean);
    const doc = Wallets.findOne(walletId);
    if (doc.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Wallets.update(walletId, { $set: { open: status } });
  },
  'wallets.closeAll'() {
    while (Wallets.find({ open: true }).count() !== 0) {
      const doc = Wallets.findOne({ open: true });
      if (doc.owner === Meteor.userId()) {
        Wallets.update(doc._id, { $set: { open: false } });
      }
    }
  },
});
