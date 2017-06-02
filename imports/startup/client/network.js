// / Remark: Code mostly taken from: https://github.com/makerdao/maker-market
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { _ } from 'meteor/underscore';
import pify from 'pify';

import web3 from '/imports/lib/web3/client';
import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/web3';
import { networkMapping } from '/imports/melon/interface/helpers/specs';


function initSession() {
  Session.set('highestBlock', 0);
  Session.set('fromPortfolio', true);
  Session.set('selectedOrderId', null);
  Session.set('showModal', true);
}

function updateWeb3() {
  const provider = (() => {
    if (web3.currentProvider.isMetaMask) {
      return 'MetaMask';
    } else if (typeof (web3.currentProvider.host) === 'string') {
      return 'LocalNode';
    }
    return 'Unknown';
  })();

  const web3State = {
    isConnected: web3.isConnected(),
    provider,
  };

  pify(web3.version.getNetwork)()
  .then((network) => {
    web3State.network = networkMapping[network];
    return pify(web3.eth.getAccounts)();
  })
  .then((accounts) => {
    web3State.account = accounts[0];
    if (accounts.length) {
      return pify(web3.eth.getBalance)(accounts[0]);
    }
    console.error('No account selected');
    return null;
  })
  .then((balance) => {
    web3State.balance = balance ? balance.div(10 ** 18).toString() : null;

    const previousState = store.getState().web3;
    const needsUpdate = Object.keys(web3State).reduce((accumulator, currentKey) =>
      accumulator || (web3State[currentKey] !== previousState[currentKey])
    , false);

    if (needsUpdate) store.dispatch(creators.update(web3State));
  })
  .catch((err) => { throw err; });
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

  Session.set('isServerConnected', true); // TODO: check if server is connected
});
