import './wallet_manage.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import lightwallet from 'eth-lightwallet';
import WalletInstance from '../../../lib/ethereum/wallet.js';

Template.wallet_manage.onCreated(function walletManageOnCreated() {
});

Template.wallet_manage.helpers({
});

Template.wallet_manage.events({
  'submit .new-wallet'(event) {

    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    const extraEntropy = target.userEntropy.value;
    target.userEntropy.value = '';

    // Create a random Seed
    const randomSeed = lightwallet.keystore.generateRandomSeed(extraEntropy);
    const infoString = 'Your new wallet seed is: "' + randomSeed +
      '". Please write it down on paper or in a password manager, ' +
      'you will need it to access your wallet. Do not let anyone see ' +
      'this seed or they can take your Ether. ' +
      'Please enter a password to encrypt your seed while in the browser.';
    console.log('Random seed is: ' + randomSeed);

    // Create new Address
    // const password = prompt(infoString, 'password');
    const password = 'password';
    lightwallet.keystore.deriveKeyFromPassword(password, function(err, pwDerivedKey) {
      WalletInstance.create(randomSeed, password, pwDerivedKey);

      // Watch Balance
      WalletInstance.watchBalance();
    });
  },
});
