import './blotter_transaction_list.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Transactions } from '/imports/api/transactions.js';


Template.blotter_transaction_list.onCreated(function transactionListOnCreated() {
  Meteor.subscribe('transactions');
});

Template.blotter_transaction_list.helpers({
  transactions() {
    return Transactions.find({}, { sort: { createdAt: -1 } });
  },
  transactionCount() {
    return Transactions.find({}).count();
  },
  isOwner() {
    return this.owner === Meteor.userId();
  },
});
