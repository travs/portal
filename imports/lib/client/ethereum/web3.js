/* global web3 */
/* eslint-disable no-global-assign */
import Web3 from 'web3';

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);

  // HACK: check for account changes and reload the browser then
  // - [ ] Improvement 1: Do not reload but update the state
  // - [ ] Improvement 2: Push MetaMask to update their API
  // (https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#ear-listening-for-selected-account-changes)
  window.setInterval((initialAccount) => {
    // if (web3.eth.accounts[0] !== initialAccount) window.location.reload();
  }, 500, web3.eth.accounts[0]);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}

export default web3;
