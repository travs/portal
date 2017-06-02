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


Meteor.startup(() => {
  const initialState = store.getState();

  Session.set('currentAssetPair', initialState.preferences.currentAssetPair);
});

Tracker.autorun(() => {
  const currentState = store.getState();

  if (Session.get('currentAssetPair') !== currentState.preferences.currentAssetPair) {
    store.dispatch(preferencesActionCreators.selectAssetPair(Session.get('currentAssetPair')));
  }
});
