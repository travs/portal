// Meteor imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// NPM imports
import moment from 'moment';
// Collections
import { Orders } from '/imports/api/orders.js';

// Corresponding html file
import './open_orders.html';

Template.open_orders.onCreated(() => {});

Template.open_orders.helpers({
  more: false,
  currentAssetPair: () => Session.get('currentAssetPair'),
  quoteTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],
  baseTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  getOpenOrders() {
    const owner = '0x00e0b33cdb3af8b55cd8467d6d13bc0ba8035acf';

    return Orders.find({
      owner,
      isActive: true,
    });
  },
  formatDate: date => moment(date).format('D.M.YYYY HH:mm:ss'),
});

Template.open_orders.onRendered(() => {});

Template.open_orders.events({});
