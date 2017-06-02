import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { EthTools } from 'meteor/ethereum:tools';

// Corresponding html file
import './walletOverview.html';


Template.walletOverview.onCreated(() => {});


<<<<<<< HEAD:imports/ui/components/wallet/wallet_overview.js
Template.wallet_overview.helpers({
=======
Template.walletOverview.helpers({
  wallets() {
    return Session.get('clientAccountList');
  },
>>>>>>> 964f2c69dfbe19a999d037a9b5f6ead00ba2dc78:imports/ui/components/wallet/walletOverview.js
  displayBalance(balance) {
    return EthTools.formatBalance(balance, '0,0.0[00] UNIT');
  },
});


Template.walletOverview.onRendered(() => {});


Template.walletOverview.events({
  'click .refresh_wallet': (event) => {
    // Prevent default browser form submit
    event.preventDefault();

    // Refresh all wallets
    web3.eth.getBalance(web3.eth.defaultAccount, (err, res) => {
      if (!err) {
        Session.set('selectedAccountBalance', res.toNumber());
      } else {
        Session.set('selectedAccountBalance', undefined);
      }
    });

    // Notification
    // TODO replace toast
    // Materialize.toast('Wallets refreshed', 4000, 'blue');
  },
});
