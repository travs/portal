import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Collections
import { Wallets } from '/imports/api/wallets.js';
// Components
import '/imports/ui/components/summary/network_summary.js';
import '/imports/ui/components/summary/executive_summary.js';
import '/imports/ui/components/wallet/wallet_list.js';
import '/imports/ui/components/wallet/wallet_manage.js';
// Corresponding html file
import './wallet.html';


Template.pagesWallet.onCreated(() => {
  Meteor.subscribe('wallets');
});


Template.pagesWallet.helpers({
  walletCount() {
    return Wallets.find({ owner: Meteor.userId() }).count();
  },
});


Template.pagesWallet.onRendered(() => {
});
