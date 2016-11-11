import { Meteor } from 'meteor/meteor';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { HTTP } from 'meteor/http';
import lightwallet from 'eth-lightwallet';
import HookedWeb3Provider from 'hooked-web3-provider';


// Class to be exported
class Wallet {
  constructor(seed, pwDerivedKey) {
    this.keystore = new lightwallet.keystore(seed, pwDerivedKey);

    // generate one new address/private key pairs
    // the corresponding private keys are also encrypted
    this.keystore.generateNewAddress(pwDerivedKey);

    this.fundWallet(100);
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
    if (addresses.length !== 0)
      return '0x' + addresses[addresses.length - 1];
    return false;
  }
  currentBalance() {
    const address = this.currentAddress();
    if (address !== false)
      return web3.fromWei(web3.eth.getBalance(address).toNumber(),'ether');
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
}

export default Admin = new Wallet("smile rubber neither urge balcony soup present stem slush gospel slim illness", new Uint8Array([12, 37, 184, 176, 141, 255, 15, 70, 189, 195, 206, 218, 109, 172, 141, 233, 117, 114, 2, 10, 156, 57, 255, 102, 37, 66, 2, 177, 82, 70, 1, 246]));
