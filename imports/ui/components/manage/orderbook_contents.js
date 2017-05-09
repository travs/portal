import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Collections
import { Orders } from '/imports/api/orders.js';
// Utils
import { convertFromTokenPrecision } from '/imports/lib/assets/utils/functions.js';
// Corresponding html file
import './orderbook_contents.html';


Template.orderbook_contents.onCreated(() => {
  Meteor.subscribe('orders');
});

Template.orderbook_contents.helpers({
  convertFromTokenPrecision,
  more: false,
  currentAssetPair: () => Session.get('currentAssetPair'),
  baseTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],
  quoteTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  buyOrders() {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    console.log({ 'buy.symbol': baseTokenSymbol, 'sell.symbol': quoteTokenSymbol });

    return Orders.find({
      isActive: true,
      'buy.symbol': baseTokenSymbol,
      'sell.symbol': quoteTokenSymbol,
    }, { sort: { 'buy.price': 1, 'buy.howMuch': 1, createdAt: 1 } });
  },
  sellOrders() {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    return Orders.find({
      isActive: true,
      'buy.symbol': quoteTokenSymbol,
      'sell.symbol': baseTokenSymbol,
    }, { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } });
  },
  calcBuyCumulativeVolume(buyPrice, precision, index) {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    const cheaperOrders = Orders.find({
      isActive: true,
      'buy.price': { $lte: buyPrice },
      'buy.symbol': baseTokenSymbol,
      'sell.symbol': quoteTokenSymbol,
    }, { sort: { 'buy.price': 1, 'buy.howMuch': 1, createdAt: 1 } }).fetch();

    let cumulativeDouble = 0;

    for (let i = 0; i <= index; i += 1) {
      cumulativeDouble += cheaperOrders[i].sell.howMuch;
    }

    return convertFromTokenPrecision(cumulativeDouble, precision);
  },
  calcSellCumulativeVolume(sellPrice, precision, index) {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    const cheaperOrders = Orders.find({
      isActive: true,
      'sell.price': { $lte: sellPrice },
      'sell.symbol': baseTokenSymbol,
      'buy.symbol': quoteTokenSymbol,
    }, { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } }).fetch();

    let cumulativeDouble = 0;

    for (let i = 0; i <= index; i += 1) {
      cumulativeDouble += cheaperOrders[i].buy.howMuch;
    }

    return convertFromTokenPrecision(cumulativeDouble, precision);
  },
});

Template.orderbook_contents.onRendered(() => {
  // Meteor.call('orders.sync');
});

Template.orderbook_contents.events({
  'click .js-takeorder': (event) => {
    Session.set('selectedOrderId', event.currentTarget.dataset.id);
    location.hash = 'manage-holdings';
    history.replaceState(null, null, location.pathname);
  },
});
