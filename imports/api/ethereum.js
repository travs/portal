import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

Meteor.methods({
  'isServerConnected'() {
    return web3.isConnected();
  },
  'sendTestnetEther'(address) {
    HTTP.get('http://faucet.ropsten.be:3001/donate/' + address);
  }
});
