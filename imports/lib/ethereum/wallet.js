import { Meteor } from 'meteor/meteor';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { HTTP } from 'meteor/http';
import lightwallet from 'eth-lightwallet';
import HookedWeb3Provider from 'hooked-web3-provider';

import { Wallets } from '../../api/wallets.js';


// Class to be exported
class Wallet {
  constructor() {
    this.keystore = new lightwallet.keystore();
  }
  init(seed, pwDerivedKey) {
    this.keystore = new lightwallet.keystore(seed, pwDerivedKey);

    // generate one new address/private key pairs
    // the corresponding private keys are also encrypted
    this.keystore.generateNewAddress(pwDerivedKey);
  }
  clear() {
    this.keystore = new lightwallet.keystore();
  }
  setWeb3Provider(keystore) {
    // Create a custom passwordProvider to prompt the user to enter their
    // password whenever the hooked web3 provider issues a sendTransaction
    // call.
    keystore.passwordProvider = function (callback) {
      callback(null, 'password');
    };
    // Now set keystore as transaction_signer in the hooked web3 provider
    // and you can start using web3 using the keys/addresses in keystore!
    // Set Hooked Provider
    const web3Provider = new HookedWeb3Provider({
      host: 'http://95.85.3.133:8545',
      transaction_signer: keystore,
    });
    return web3Provider;
  }
  currentAddress() {
    const addresses = this.keystore.getAddresses();
    if (addresses.length !== 0) {
      return '0x' + addresses[addresses.length - 1];
    }
    return false;
  }
  currentBalance() {
    const address = this.currentAddress();
    if (address !== false) {
      return web3.eth.getBalance(address).toNumber();
    }
    return false;
  }
  fundWallet(endAmount) {
    const address = this.currentAddress();
    if (address !== false && this.currentBalance() <= endAmount) {
      const url = 'http://icarus.parity.io/rain/' + address;
      // Call Gavin Woods Parity Party
      HTTP.call('GET', url, function (error, result) {
        if (!error) {
          console.log(result);
        }
      });
    }
  }
  refreshAllWallets() {
    // Update Wallets
    const docs = Wallets.find({}, { sort: { createdAt: -1 } }).fetch();
    for (const doc of docs) {
      const walletId = doc._id;
      const address = doc.address;
      const balance = doc.balance;
      if (balance === web3.eth.getBalance(address).toNumber()) {
        Materialize.toast('Wallets refreshed', 4000, 'blue');
        return true;
      } else if (balance < web3.eth.getBalance(address).toNumber()) {
        Materialize.toast('Funds received', 4000, 'green');
      } else {
        Materialize.toast('Funds have been sent', 4000, 'blue');
      }
      const newBalance = web3.eth.getBalance(address).toNumber();
      const newNonce = web3.eth.getTransactionCount(address);
      // Update a wallet into the collection
      Meteor.call('wallets.updateBalance', walletId, newBalance, newNonce);
    }
    // Notification
    Materialize.toast('Wallets refreshed', 4000, 'blue');
  }
  watchBalance() {
    if (this.currentAddress() === false) {
      return false;
    }

    // Wallet document
    const address = this.currentAddress();
    const doc = Wallets.findOne({ address: address });
    const walletId = doc._id;
    let currBalance = web3.eth.getBalance(address).toNumber();
    let currNonce = web3.eth.getTransactionCount(address);

    // Update Wallet document
    var filter = web3.eth.filter('latest').watch(function() {
      const balance = web3.eth.getBalance(address).toNumber();
      const nonce = web3.eth.getTransactionCount(address);
      // Check if Balance or Nonce has changed
      if (currBalance !== balance || currNonce !== nonce) {
        if (currBalance === 0) {
          Materialize.toast('Congratulations! Your Account has been funded', 6000, 'green');
          Materialize.toast('Go ahead and create a portfolio now', 4000, 'blue');
        } else {
          Materialize.toast('Balance has changed', 4000, 'orange');
        }
        // Uninstall Filter
        filter.stopWatching();
        // Update current values
        currBalance = balance;
        currNonce = nonce;
        // Update a wallet into the collection
        Meteor.call('wallets.updateBalance', walletId, balance, nonce);
      }
    });
    return true;
  }
  create(randomSeed, password, pwDerivedKey) {
    this.keystore = new lightwallet.keystore(randomSeed, pwDerivedKey);

    // generate one new address/private key pairs
    // the corresponding private keys are also encrypted
    this.keystore.generateNewAddress(pwDerivedKey);

    // Notify user
    Materialize.toast('Please wait while your wallet is being funded - this can take 30 seconds and longer.', 30000, 'blue');

    // Insert into Collection
    const address = '0x' + this.keystore.getAddresses();

    // Insert a wallet into the collection
    Meteor.call('wallets.insert', address, randomSeed);

    // Fund Latest Wallet
    const url = 'http://icarus.parity.io/rain/' + address;

    // Call Gavin Woods Parity Party
    HTTP.call('GET', url, function (error, result) {
      if (!error) {
        console.log(result);
      }
    });

    // Now set keystore as transaction_signer in the hooked web3 provider
    // and you can start using web3 using the keys/addresses in keystore!
    // Set Hooked Provider
    this.setWeb3Provider(this.keystore);
  }
  import(secretSeed, pwDerivedKey) {
    this.keystore = new lightwallet.keystore(secretSeed, pwDerivedKey);

    // generate one new address/private key pairs
    // the corresponding private keys are also encrypted
    this.keystore.generateNewAddress(pwDerivedKey);

    // Now set keystore as transaction_signer in the hooked web3 provider
    // and you can start using web3 using the keys/addresses in keystore!
    // Set Hooked Provider
    this.setWeb3Provider(this.keystore);
  }
  export(pwDerivedKey) {
    if (this.currentAddress() === false)
      return false
    else
      return this.keystore.getSeed(pwDerivedKey);
  }
}

export default WalletInstance = new Wallet();
