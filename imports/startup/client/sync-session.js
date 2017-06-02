// TODO: Delete this file!
// This is a temporary bridge between Meteor sessions and Redux
// the goal is to get rid of Meteor sessions completely and manage
// state exclusively in Redux. Until then, this file helps to ease
// the transition
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import { creators as preferencesActionCreators } from '/imports/redux/preferences';

import store from '/imports/startup/client/store';

// sync from redux store to session
store.subscribe(() => {
  const currentState = store.getState();

  Session.set('currentAssetPair', currentState.preferences.currentAssetPair);
  Session.set('isClientConnected', currentState.web3.isConnected);
  Session.set('selectedAccount', currentState.web3.account);
  Session.set('selectedAccountBalance', currentState.web3.balance);
  Session.set('network', currentState.web3.network);
});

// sync from session to redux store
// ATTENTION: Do not use this, if you really know what you are doing
// the transition should be like this: event -> redux action -> session
Tracker.autorun(() => {
  const currentState = store.getState();

  if (Session.get('currentAssetPair') !== currentState.preferences.currentAssetPair) {
    store.dispatch(preferencesActionCreators.selectAssetPair(Session.get('currentAssetPair')));
  }
});
