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
  fromWei(weiValue, type) {
    return web3.fromWei(weiValue, type).toString(10);
  },
  displayBalance(balance) {
    return EthTools.formatBalance(balance.toString(10), '0,0.0[00] UNIT');
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
  // 'click .export'() {
  //   $('#modalExport').openModal();
  //   // Init Reactive Dict
  //   const reactiveState = Template.instance().state;
  //
  //   if (WalletInstance.currentAddress() === false)
  //     return;
  //
  //   // let password = prompt('Enter password to show your seed. Do not let anyone else see your seed.', 'password');
  //   const password = 'password';
  //   lightwallet.keystore.deriveKeyFromPassword(password, function(err, pwDerivedKey) {
  //     const seed = WalletInstance.export(pwDerivedKey);
  //     // Set value to form element
  //     reactiveState.set({ seed });
  //   });
  // },
  // 'click .unlock'() {
  //   // Get Wallet document
  //   const seed = this.seed;
  //   const address = this.address;
  //   const doc = Wallets.findOne({ address });
  //   const walletId = doc._id;
  //
  //   // Close open Wallet
  //   if (Wallets.find({ address, open: true }).count() !== 0) {
  //     WalletInstance.clear();
  //     Meteor.call('wallets.updateStatus', walletId, false);
  //     Materialize.toast('Wallet closed', 4000, 'green');
  //     return;
  //   }
  //
  //   // Can only unlock one Wallet at a time
  //   if (Wallets.find({ open: true }).count() !== 0) {
  //     Materialize.toast('Can not unlock more than one wallet at a time', 4000, 'orange');
  //     return;
  //   }
  //
  //   // Unlock Wallet
  //   // let password = prompt('Enter Password to encrypt your seed', 'password');
  //   const password = 'password';
  //   lightwallet.keystore.deriveKeyFromPassword(password, function(err, pwDerivedKey) {
  //     WalletInstance.import(seed, pwDerivedKey);
  //     Meteor.call('wallets.updateStatus', walletId, true);
  //   });
  // },
  // 'click .delete'() {
  //   $('#modalDelete').openModal();
  //   // Init Reactive Dict
  //   const reactiveState = Template.instance().state;
  //   const walletId = this._id;
  //   reactiveState.set({ walletId });
  // },
  // 'click .deleteAgreed'() {
  //   // Init Reactive Dict
  //   const reactiveState = Template.instance().state;
  //   const walletId = reactiveState.get('walletId');
  //   // Delete
  //   WalletInstance.clear();
  //   Meteor.call('wallets.remove', walletId);
  //   reactiveState.set({ walletId: '' });
  //   Materialize.toast('Wallet deleted!', 4000, 'green')
  // },
  // 'click .lock'() {
  //   // Get Wallet document
  //   const seed = this.seed;
  //   const address = this.address;
  //   const doc = Wallets.findOne({ address });
  //   const walletId = doc._id;
  //
  //   // Close open Wallet
  //   if (Wallets.find({ address, open: true }).count() !== 0) {
  //     WalletInstance.clear();
  //     Meteor.call('wallets.updateStatus', walletId, false);
  //     Materialize.toast('Wallet closed', 4000, 'green');
  //     return;
  //   }
  // },
  // 'click .refresh-wallets'() {
  //   // Prevent default browser form submit
  //   event.preventDefault();
  //
  //   // Refresh all wallets
  //   WalletInstance.refreshAllWallets();
  // },
});
