// TODO: Delete this file!
// This is a temporary bridge between Meteor sessions and Redux
// the goal is to get rid of Meteor sessions completely and manage
// state exclusively in Redux. Until then, this file helps to ease
// the transition
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import store from '/imports/startup/client/store';

// sync from redux store to session
store.subscribe(() => {
  const currentState = store.getState();
  Session.set('currentAssetPair', currentState.preferences.currentAssetPair);
  Session.set('isClientConnected', currentState.web3.isConnected);
  Session.set('isServerConnected', currentState.web3.isServerConnected);
  Session.set('selectedAccount', currentState.web3.account);
  Session.set('selectedAccountBalance', currentState.web3.balance);
  Session.set('network', currentState.web3.network);
  Session.set('currentBlock', currentState.web3.currentBlock);
  Session.set('isSynced', currentState.web3.isSynced);
});

// initialize the other session vars
// TODO: Remove this
Meteor.startup(() => {
  Session.set('fromPortfolio', true);
  Session.set('selectedOrderId', null);
  Session.set('showModal', true);
  Session.set('isLoaded', false);
});
