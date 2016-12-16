import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
// Collections
import { Portfolios } from '/imports/api/portfolios.js';
// Smart contracts
import Core from '/imports/lib/assets/contracts/Core.sol.js';
// Corresponding html file
import './portfolio_list.html';


Template.portfolio_list.onCreated(function portfolioListOnCreated() {
  Meteor.subscribe('portfolios');
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
    return this.owner === Session.get('clientDefaultAccount');
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
