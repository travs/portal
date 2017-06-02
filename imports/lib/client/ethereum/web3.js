/* eslint-disable no-underscore-dangle */
import Web3 from 'web3';


/*

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
*/


window.__AppInitializedBeforeWeb3__ = false;

let web3Instance = new Web3();

const initWeb3Instance = () => {
  if (!web3Instance && !window.__AppInitializedBeforeWeb3__) {
    throw new Error(`
      Tryin to access web3 before app is initialized.
      Did you set window.__AppInitializedBeforeWeb3__ = true in your app startup code?
    `);
  }
  web3Instance = web3Instance || window.web3 === undefined
    ? new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    : new Web3(window.web3.currentProvider);

  window.web3 = new Proxy(web3Instance, {
    get(target, property) {
      console.warn('Do not use window.web3. Import it from "/imports/lib/client/ethereum/web3.js"');
      console.trace();
      return web3Instance[property];
    },
    set(target, property, value) {
      console.warn('Do not use window.web3. Import it from "/imports/lib/client/ethereum/web3.js"');
      console.trace();
      web3Instance[property] = value;
      return true;
    },
  });
};

const web3Proxy = new Proxy(web3Instance, {
  get(target, property) {
    initWeb3Instance();
    return web3Instance[property];
  },
  set(target, property, value) {
    initWeb3Instance();
    web3Instance[property] = value;
    return true;
  },
});

export default web3Proxy;
