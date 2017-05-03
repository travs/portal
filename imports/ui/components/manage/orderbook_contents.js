import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Orders } from '/imports/api/orders.js';
// Corresponding html file
import './orderbook_contents.html';


const convertFromTokenPrecision = (value, precision) => {
  const divisor = Math.pow(10, precision);
  return value / divisor;
};

Template.orderbook_contents.onCreated(() => {
  Meteor.subscribe('orders');
  console.log('Template.orderbook_contents.onCreated');
});

Template.orderbook_contents.helpers({
  convertFromTokenPrecision,
  more: false,
  currentAssetPair: () => Session.get('currentAssetPair'),
  quoteTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],
  baseTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  buyOrders() {
    const [quoteTokenSymbol, baseTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

    return Orders.find({
      isActive: true,
      'buy.symbol': baseTokenSymbol,
      'sell.symbol': quoteTokenSymbol,
    }, { sort: { 'buy.price': 1 } });
  },
  sellOrders() {
    const [quoteTokenSymbol, baseTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

    return Orders.find({
      isActive: true,
      'buy.symbol': quoteTokenSymbol,
      'sell.symbol': baseTokenSymbol,
    }, { sort: { 'sell.price': 1 } });
  },
  calcBuyCumulativeVolume(buyPrice, precision) {
    const [quoteTokenSymbol, baseTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

    const cheaperOrders = Orders.find({
      isActive: true,
      'buy.price': { $lte: buyPrice },
      'buy.symbol': baseTokenSymbol,
      'sell.symbol': quoteTokenSymbol,
    }, { sort: { 'buy.price': 1 } }).fetch();

    const cummulatedDouble = cheaperOrders.reduce(
      (accumulator, currentValue) => accumulator + currentValue.buy.howMuch, 0);

    return convertFromTokenPrecision(cummulatedDouble, precision);
  },
  openOrders() {
    const address = FlowRouter.getParam('address');
    return Orders.find({ owner: address }, { sort: { id: -1 } });
  },
});

Template.orderbook_contents.onRendered(() => {
  // Meteor.call('orders.sync');
});

Template.orderbook_contents.events({});
