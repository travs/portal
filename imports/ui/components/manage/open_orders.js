// Meteor imports
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// NPM imports
import moment from 'moment';
// Utils
import { convertFromTokenPrecision } from '/imports/lib/assets/utils/functions.js';
// Collections
import { Orders } from '/imports/api/orders.js';

// Corresponding html file
import './open_orders.html';


Template.open_orders.onCreated(() => {});

Template.open_orders.helpers({
  more: false,
  currentAssetPair: () => Session.get('currentAssetPair'),
  baseTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],
  quoteTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  getOpenOrders() {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    const owner = Session.get('fromPortfolio')
      ? FlowRouter.getParam('address')
      : Session.get('clientManagerAccount');

    return Orders.find({
      owner,
      isActive: true,
      $or: [
        { 'buy.symbol': { $in: [baseTokenSymbol, quoteTokenSymbol] } },
        { 'sell.symbol': { $in: [baseTokenSymbol, quoteTokenSymbol] } },
      ],
    });
  },
  buyOrSell: buyTokenSymbol =>
    (buyTokenSymbol === (Session.get('currentAssetPair') || '---/---').split('/')[1]
    ? 'sell' : 'buy'
  ),
  getPrice(order) {
    const quoteTokenSymbol = (Session.get('currentAssetPair') || '---/---')[1];
    const details = order.buy.symbol === quoteTokenSymbol
      ? order.sell : order.buy;

    return details.price;
  },
  getVolume(order) {
    const quoteTokenSymbol = (Session.get('currentAssetPair') || '---/---')[1];
    const details = order.buy.symbol === quoteTokenSymbol
      ? order.buy : order.sell;

    return convertFromTokenPrecision(details.howMuch, details.precision);
  },
  formatDate: date => moment(date).format('D.M.YYYY HH:mm:ss'),
});

Template.open_orders.onRendered(() => {});

Template.open_orders.events({});
