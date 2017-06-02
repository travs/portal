// / Remark: Code mostly taken from: https://github.com/makerdao/maker-market
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { _ } from 'meteor/underscore';

import web3 from '/imports/lib/web3/client';
import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/network';
import { networkMapping } from '/imports/melon/interface/helpers/specs';


// Check which accounts are available and if defaultAccount is still available,
// Otherwise set it to localStorage, Session, or first element in accounts
function checkAccounts() {
  web3.eth.getAccounts((error, accounts) => {
    if (error) Session.set('isClientConnected', false);
    else if (!error) {
      if (!_.contains(accounts, web3.eth.defaultAccount)) {
        if (_.contains(accounts, localStorage.getItem('selectedAccount'))) {
          web3.eth.defaultAccount = localStorage.getItem('selectedAccount');
        } else if (_.contains(accounts, Session.get('selectedAccount'))) {
          web3.eth.defaultAccount = Session.get('selectedAccount');
        } else if (accounts.length > 0) {
          web3.eth.defaultAccount = accounts[0];
        } else {
          web3.eth.defaultAccount = undefined;
        }
      }
      localStorage.setItem('selectedAccount', web3.eth.defaultAccount);
      web3.eth.getBalance(web3.eth.defaultAccount, (error, result) => {
        if (!error) {
          Session.set('selectedAccountBalance', result.toNumber());
        } else {
          Session.set('selectedAccountBalance', undefined);
        }
      });
      Session.set('selectedAccount', web3.eth.defaultAccount);
      Session.set('getAccountCount', accounts.length);
      Session.set('clientAccountList', accounts);
      Session.set('isClientConnected', true);
    }
  });
}

function initSession() {
  Session.set('network', false);
  Session.set('isClientConnected', false);
  Session.set('highestBlock', 0);
  Session.set('fromPortfolio', true);
  Session.set('selectedOrderId', null);
  Session.set('showModal', true);
}

function checkIfSynching() {
  web3.eth.isSyncing((e, r) => {
    if (!e) {
      if (r) {
        /* sync object:
        {
           startingBlock: 300,
           currentBlock: 312,
           highestBlock: 512
        }
        */
        Session.set('startingBlock', r.startingBlock);
        Session.set('currentBlock', r.currentBlock);
        Session.set('highestBlock', r.highestBlock);
      } else {
        Session.set('isSynced', true);
      }
    } else {
      console.error(`Error: ${e} \nIn web3.eth.isSyncing`);
    }
  });
}

function initWeb3() {
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

  if (web3State.isConnected && web3.version.network) {
    web3State.network = networkMapping[web3.version.network];
  } else if (web3State.isConnected) {
    throw new Error('Cannot determine network');
  }

  store.dispatch(creators.init(web3State));
}

// EXECUTION
Meteor.startup(() => {
  console.log('Meteor Startup');
  /* eslint-disable no-underscore-dangle */
  window.__AppInitializedBeforeWeb3__ = true;
  /* eslint-enable */

  initWeb3();

  Session.set('isServerConnected', true); // TODO: check if server is connected

  /*
  initSession();
  checkIfSynching();
  checkAccounts();
  */

  initWeb3();
});
