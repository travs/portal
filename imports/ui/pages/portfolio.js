import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Portfolios } from '/imports/api/portfolios.js';
import { Wallets } from '/imports/api/wallets.js';
import WalletInstance from '/imports/lib/ethereum/wallet.js';
// Components
import '/imports/ui/components/summary/network_summary.js';
import '/imports/ui/components/summary/executive_summary.js';
import '/imports/ui/components/portfolio/portfolio_new.js';
import '/imports/ui/components/portfolio/portfolio_list.js';
import '/imports/ui/components/portfolio/portfolio_manage.js';
// Corresponding html file
import './portfolio.html';


Template.pagesPortfolio.onCreated(() => {
  Meteor.subscribe('portfolios');
  Meteor.subscribe('wallets');

  //TODO better
  // No Portfolio created
  // if (Portfolios.find({ owner: Meteor.userId() }).count() === 0) {
  //   // No wallet
  //   if (Wallets.find({}).count() === 0) {
  //     Materialize.toast('Get started by creating a Wallet', 4000, 'blue');
  //     FlowRouter.go('/wallet');
  //   } else if (WalletInstance.currentAddress() === false) {
  //     Materialize.toast('To set up a portfolio you must first open a wallet', 8000, 'blue');
  //     FlowRouter.go('/wallet');
  //   } else if (WalletInstance.currentBalance() === 0) {
  //     Materialize.toast('Your wallet has not been funded yet.', 4000, 'orange');
  //     FlowRouter.go('/wallet');
  //   } else {
  //     Materialize.toast('Set up a portfolio', 4000, 'green');
  //     FlowRouter.go('/portfolio');
  //   }
  // }
});


Template.pagesPortfolio.helpers({
  portfolioCount() {
    return Portfolios.find({ owner: Meteor.userId() }).count();
  },
  walletCount() {
    return Wallets.find({ owner: Meteor.userId() }).count();
  },
  isWalletUnlocked() {
    if (Wallets.find({ open: true }).count() !== 0) {
      return true;
    }
    return false;
  },
});


Template.pagesPortfolio.onRendered(() => {
});
