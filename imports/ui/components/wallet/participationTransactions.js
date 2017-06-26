import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// NPM imports
import moment from 'moment';
// Collections
import Transactions from '/imports/api/transactions';
// Utils
import BigNumber from 'bignumber.js';

// Corresponding html file
import './participationTransactions.html';

Template.participationTransactions.onCreated(() => {
  Meteor.subscribe('transactions', FlowRouter.getParam('address'));
});

Template.participationTransactions.helpers({
  getParticipationTransactions: () => {
    const transac = Transactions.find({}).fetch();
    console.log(transac.amountOfShares);
    return Transactions.find({}).fetch();
  },
  displayType: eventType =>
    eventType === 'SharesCreated' ? 'Invest' : 'Redeem',
  displayVolume: amount => Number(amount) / Math.pow(10, 18),
  formatDate: date => moment(date).format('D.M.YYYY HH:mm:ss'),
});

Template.participationTransactions.onRendered(() => {});

Template.participationTransactions.events({});
