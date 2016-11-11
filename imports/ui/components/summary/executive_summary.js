import './executive_summary.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Portfolios } from '/imports/api/portfolios.js';
import { Wallets } from '/imports/api/wallets.js';
import WalletInstance from '/imports/lib/ethereum/wallet.js';


Template.executive_summary.onCreated(() => {
  Meteor.subscribe('portfolios');
  Meteor.subscribe('wallets');

  // Check Wallet state
  const address = WalletInstance.currentAddress();
  if (address === false) {
    Meteor.call('wallets.closeAll');
  } else {
    const doc = Wallets.findOne({ address });
    const walletId = doc._id;
    Meteor.call('wallets.updateStatus', walletId, true);
  }
});


Template.executive_summary.helpers({
  // Wallets
  walletCount() {
    return Wallets.find({}).count();
  },
  isWalletUnlocked() {
    if (Wallets.find({ open: true }).count() !== 0) {
      return true;
    }
    return false;
  },
  unlockedWallet() {
    // Wallet needs to be unlocked
    const doc = Wallets.findOne({ owner: Meteor.userId(), open: true });
    return doc.address;
  },
  // Portfolios
  portfolioCount() {
    return Portfolios.find({ owner: Meteor.userId() }).count();
  },
  selectedPortfolioName() {
    const doc = Portfolios.findOne({ owner: Meteor.userId() });
    return doc.portfolioName;
  },
  selectedPortfolioId() {
    const doc = Portfolios.findOne({ owner: Meteor.userId() });
    return doc._id;
  },
  selectedPortfolioDelta() {
    const doc = Portfolios.findOne({ owner: Meteor.userId() });
    return doc.delta;
  },
});


Template.executive_summary.onRendered(() => {
});
