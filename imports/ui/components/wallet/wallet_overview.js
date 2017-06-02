import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { EthTools } from 'meteor/ethereum:tools';

// Corresponding html file
import './wallet_overview.html';


Template.wallet_overview.onCreated(() => {});


Template.wallet_overview.helpers({
  displayBalance(balance) {
    return EthTools.formatBalance(balance, '0,0.0[00] UNIT');
  },
});


Template.wallet_overview.onRendered(() => {});


Template.wallet_overview.events({
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
