// / Remark: Code mostly taken from: https://github.com/makerdao/maker-market
import pify from 'pify';

import web3 from '/imports/lib/web3/client';
import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/web3';
import { networkMapping } from '/imports/melon/interface/helpers/specs';

async function updateWeb3() {
  const provider = (() => {
    if (web3.currentProvider.isMetaMask) {
      return 'MetaMask';
    } else if (typeof web3.currentProvider === 'object') {
      return 'LocalNode';
    }
    return 'Unknown';
  })();

  const web3State = {
    isConnected: web3.isConnected(),
    provider,
  };

  try {
    web3State.isServerConnected = await pify(Meteor.call)('isServerConnected');

    const accounts = await pify(web3.eth.getAccounts)();
    const balance = await pify(web3.eth.getBalance)(accounts[0]);
    web3State.account = accounts[0];
    web3State.network = networkMapping[await pify(web3.version.getNetwork)()];
    web3State.balance = balance ? balance.div(10 ** 18).toString() : null;
    web3State.currentBlock = await pify(web3.eth.getBlockNumber)();
    web3State.isSynced = !await pify(web3.eth.getSyncing)();
  } catch (e) {
    console.error(e);
  }

  const previousState = store.getState().web3;
  const needsUpdate = Object.keys(web3State).reduce(
    (accumulator, currentKey) =>
      accumulator || web3State[currentKey] !== previousState[currentKey],
    false,
  );

  if (needsUpdate) store.dispatch(creators.update(web3State));
}

// We need to wait for the page load instead of meteor startup to be certain that metamask is injected.
window.addEventListener('load', function() {
  /* eslint-disable no-underscore-dangle */
  window.__AppInitializedBeforeWeb3__ = true;
  /* eslint-enable */
  updateWeb3();
  window.setInterval(updateWeb3, 4000);
});
