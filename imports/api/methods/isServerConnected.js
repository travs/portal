import { Meteor } from 'meteor/meteor';

import web3 from '/imports/lib/web3';


Meteor.methods({
  isServerConnected() {
    if (Meteor.isClient) {
      return null;
    } else {
      return web3.isConnected();
    }
  }
});
