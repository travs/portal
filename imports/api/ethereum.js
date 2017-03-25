import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';

// TODO implement
function checkIfSynching(callback) {
  web3.eth.isSyncing((err, sync) => {
    if (!err) {
      callback(null, sync !== false);
    } else {
      callback(err, undefined);
    }
  });
}

Meteor.methods({
  isServerConnected: () => {
    console.log(web3.isConnected());
    return web3.isConnected();
  },
  // TODO via check if syncing
  isServerSnycing: () => {},
  // TODO via external server (eg client side blknumber) && comparing blocknumbers
  isServerInSync: () => {},
  sendTestnetEther: (address) => {
    check(address, String);
    return HTTP.get(`http://faucet.ropsten.be:3001/donate/${address}`).data;
  },
});
