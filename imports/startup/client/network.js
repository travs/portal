// / Remark: Code mostly taken from: https://github.com/makerdao/maker-market
import { Session } from 'meteor/session';
import pify from 'pify';

import web3 from '/imports/lib/web3/client';
import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/web3';
import { networkMapping } from '/imports/melon/interface/helpers/specs';


async function updateWeb3() {
  const provider = (() => {
    if (web3.currentProvider.isMetaMask) {
      return 'MetaMask';
    } else if (typeof (web3.currentProvider.host) === 'string') {
      return 'LocalNode';
    }
    return 'Unknown';
  })();

  const accounts = await pify(web3.eth.getAccounts)();
  const account = accounts[0];
  const balance = await pify(web3.eth.getBalance)(account);

  const web3State = {
    isConnected: web3.isConnected(),
    provider,
    account,
    network: networkMapping[await pify(web3.version.getNetwork)()],
    balance: balance ? balance.div(10 ** 18).toString() : null,
    isServerConnected: await pify(Meteor.call)('isServerConnected'),
    currentBlock: await pify(web3.eth.getBlockNumber)(),
    isSynced: await pify(web3.eth.getSyncing)() ? false : true,
  };

  const previousState = store.getState().web3;
  const needsUpdate = Object.keys(web3State).reduce((accumulator, currentKey) =>
    accumulator || (web3State[currentKey] !== previousState[currentKey])
  , false);

  if (needsUpdate) store.dispatch(creators.update(web3State));
}

// EXECUTION
// The onload event is fired way after the meteor startup event
// But if MetaMask gets ever injected, then it will be injected before
// this event.
// Using Meteor.startup ... could fire before the meta-mask injection
window.addEventListener('load', function() {
  /* eslint-disable no-underscore-dangle */
  window.__AppInitializedBeforeWeb3__ = true;
  /* eslint-enable */

  updateWeb3();
  window.setInterval(updateWeb3, 4000);
});
