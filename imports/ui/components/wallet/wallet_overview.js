import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { EthTools } from 'meteor/ethereum:tools';

// Corresponding html file
import './wallet_overview.html';


Template.wallet_overview.onCreated(() => {});


Template.wallet_overview.helpers({
  wallets() {
    return Session.get('clientAccountList');
  },
  displayBalance(balance) {
    return EthTools.formatBalance(balance, '0,0.0[00] UNIT');
  },
});


Template.wallet_overview.onRendered(() => {});


Template.wallet_overview.events({
  'click .fund_wallet': () => {
    const address = Session.get('clientManagerAccount');

    Meteor.call('sendTestnetEther', address, (err, res) => {
      if (!err) {
        const amount = parseInt(web3.fromWei(parseInt(res.data, 10), 'ether'), 10);
        const msg = res.message;
        if (amount === 0) {
          Materialize.toast(`Ethereum Faucet says: "${msg}"`, 30000, 'red');
          Materialize.toast(`Go to: https://faucet.metamask.io/ for an alternative faucet`, 30000, 'blue');
        } else {
          Materialize.toast(`Sent ${amount} ETH to your account.  Wait a few seconds and let it rain!`, 30000, 'green');        }
      } else {
        console.log(err);
      }
    });
    // TODO implement cleaner
    // // Wallet refresh
    // web3.eth.getBalance(web3.eth.defaultAccount, (err, res) => {
    //   if (!err) {
    //     const balance = res;
    //     // Wallet listen
    //     const filter = web3.eth.filter('latest').watch(() => {
    //       let currBalance;
    //       web3.eth.getBalance(address, (err, res) => {
    //         if (!err) {
    //           currBalance = res.toNumber();
    //         } else {
    //           Session.set('clientManagerAccountBalance', undefined);
    //         }
    //       });
    //       // Check if Balance has changed
    //       if (currBalance !== balance) {
    //         if (currBalance === 0) {
    //           Materialize.toast('Congratulations! Your Account has been funded', 6000, 'green');
    //           Materialize.toast('Go ahead and create a portfolio now', 4000, 'blue');
    //         } else {
    //           Materialize.toast('Balance has changed', 4000, 'orange');
    //         }
    //         // Uninstall Filter
    //         filter.stopWatching();
    //       }
    //     });
    //   }
    // });
  },
  'click .refresh_wallet': (event) => {
    // Prevent default browser form submit
    event.preventDefault();

    // Refresh all wallets
    web3.eth.getBalance(web3.eth.defaultAccount, (err, res) => {
      if (!err) {
        Session.set('clientManagerAccountBalance', res.toNumber());
      } else {
        Session.set('clientManagerAccountBalance', undefined);
      }
    });

    // Notification
    Materialize.toast('Wallets refreshed', 4000, 'blue');
  },
});
