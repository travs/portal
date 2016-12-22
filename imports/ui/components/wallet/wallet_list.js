import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { $ } from 'meteor/jquery';
import { ReactiveDict } from 'meteor/reactive-dict';
import { EthTools } from 'meteor/ethereum:tools';
import { BigNumber } from 'web3';


// import { Wallets } from '../../../api/wallets.js';

import './wallet_list.html';


Template.wallet_list.onCreated(function walletListOnCreated() {
  this.state = new ReactiveDict();
  this.state.set({ seed: 'Please wait for seed to load..' });

  // Subscriptions
  // Meteor.subscribe('wallets');
});

Template.wallet_list.helpers({
  wallets() {
    return Session.get('clientAccountList');
  },
  displayBalance(balance) {
    return EthTools.formatBalance(balance, '0,0.0[00] UNIT');
  },
});


Template.wallet_list.onRendered(function walletListOnRendered() {
  $('.modal-trigger').leanModal({
    dismissible: false,
    opacity: 0.5, // Opacity of modal background
    in_duration: 300, // Transition in duration
    out_duration: 200, // Transition out duration
  });
});


Template.wallet_list.events({
  'click .fund_wallet'() {
    const address = Session.get('clientMangerAccount');
    Meteor.call('sendTestnetEther', address, (err) => {
      if(!err) {
        Materialize.toast('We\'ve sent you some funds', 30000, 'green');
      } else {
        console.log(err);
      }
    });

    // Wallet listen
    const balance = Session.get('clientMangerAccountBalance');
    var filter = web3.eth.filter('latest').watch(() => {
      let currBalance;
      web3.eth.getBalance(address, (error, result) => {
        if(!error) {
          currBalance = result.toNumber();
        } else {
          Session.set('clientMangerAccountBalance', undefined);
        }
      });
      // Check if Balance has changed
      if (currBalance !== balance) {
        if (currBalance === 0) {
          Materialize.toast('Congratulations! Your Account has been funded', 6000, 'green');
          Materialize.toast('Go ahead and create a portfolio now', 4000, 'blue');
        } else {
          Materialize.toast('Balance has changed', 4000, 'orange');
        }
        // Uninstall Filter
        filter.stopWatching();
      }
    });
  },
  'click .refresh-wallets'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Refresh all wallets
    web3.eth.getBalance(web3.eth.defaultAccount, (error, result) => {
      if (!error) {
        Session.set('clientMangerAccountBalance', result.toNumber());
      } else {
        Session.set('clientMangerAccountBalance', undefined);
      }
    });

    // Notification
    Materialize.toast('Wallets refreshed', 4000, 'blue');
  },
});
