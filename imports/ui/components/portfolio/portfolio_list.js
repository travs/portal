import './portfolio_list.html';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import { Portfolios } from '/imports/api/portfolios.js';
import { Wallets } from '/imports/api/wallets.js';

import Core from '/imports/lib/assets/Core.sol.js';
// const provider = new Web3.providers.HttpProvider('http://localhost:8545')
// ConvertLib.setProvider(provider)
Core.setProvider(WalletInstance.setWeb3Provider(WalletInstance.keystore));


Template.portfolio_list.onCreated(function portfolioListOnCreated() {
  Meteor.subscribe('portfolios');
  Meteor.subscribe('wallets');

  Session.set('sharePrice', 1);
  Session.set('sumInvested', 0);
  Session.set('sumWithdrawn', 0);
});


Template.portfolio_list.helpers({
  portfolios() {
    return Portfolios.find({}, { sort: { createdAt: -1 } });
  },
  portfolioCount() {
    return Portfolios.find({}).count();
  },
  isWalletUnlocked() {
    if (Wallets.find({ open: true }).count() !== 0) {
      return true;
    }
    return false;
  },
  isOwner() {
    return this.owner === Meteor.userId();
  },
});


Template.portfolio_list.events({
  'click .delete'() {
    Meteor.call('portfolios.remove', this._id);
    Materialize.toast('Portfolio deleted!', 4000, 'blue') // 4000 is the duration of the toast

  },
  'click .toogle-private'() {
    Meteor.call('portfolios.setPrivate', this._id, !this.private)
    Materialize.toast('Status changed!', 4000, 'green') // 4000 is the duration of the toast
  },
});
