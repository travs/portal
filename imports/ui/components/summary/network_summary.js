import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import './network_summary.html';


Template.network_summary.onCreated(() => {
});

Template.network_summary.helpers({
  isMainNetwork() {
    return Session.get('network') == 'main';
  },
  isTestNetwork() {
    return Session.get('network') == 'test';
  },
  getNetwork() {
    return Session.get('network');
  },
  isSynced() {
    return Session.get('syncing') === false;
  },
  latestBlock() {
    console.log(Session.get('latestBlock'))
    return Session.get('latestBlock');
  },
});


Template.network_summary.onRendered(() => {
});
