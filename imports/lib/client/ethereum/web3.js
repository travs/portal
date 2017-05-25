import { Meteor } from 'meteor/meteor';
import Web3 from 'web3';


if (typeof web3 !== 'undefined') {
  window.web3 = new Web3(window.web3.currentProvider);

  // HACK: check for account changes and reload the browser then
  // - [ ] Improvement 1: Do not reload but update the state
  // - [ ] Improvement 2: Push MetaMask to update their API
  // (https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#ear-listening-for-selected-account-changes)
  let initialAccount = window.web3.eth.accounts[0];
  window.setInterval(() => {
    const currentAccount = window.web3.eth.accounts[0];
    if (!initialAccount && currentAccount) initialAccount = currentAccount;
    if (currentAccount !== initialAccount) window.location.reload();
  }, 500);
} else {
  window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}


export default window.web3;
