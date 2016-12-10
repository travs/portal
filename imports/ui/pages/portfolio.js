import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
// Collections
import { Portfolios } from '/imports/api/portfolios.js';
// Components
import '/imports/ui/components/summary/network_summary.js';
import '/imports/ui/components/summary/executive_summary.js';
import '/imports/ui/components/portfolio/portfolio_new.js';
// import '/imports/ui/components/portfolio/portfolio_list.js';
// import '/imports/ui/components/portfolio/portfolio_manage.js';
// Corresponding html file
import './portfolio.html';


Template.portfolio.onCreated(() => {
  Meteor.subscribe('portfolios');

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


Template.portfolio.helpers({
  portfolioCount() {
    return Portfolios.find({ owner: Session.get('clientDefaultAccount') }).count();
  },
});


Template.portfolio.onRendered(() => {
});
