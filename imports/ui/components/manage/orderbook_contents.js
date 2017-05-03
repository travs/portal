import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Orders } from '/imports/api/orders.js';
// Specs
import specs from '/imports/lib/assets/utils/specs.js';
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
  orders() {
    const [quoteTokenSymbol, baseTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

    return Orders.find({
      isActive: true,
      'buy.symbol': { $in: [quoteTokenSymbol, baseTokenSymbol] },
      'sell.symbol': { $in: [quoteTokenSymbol, baseTokenSymbol] },
    }, { sort: { 'buy.price': 1 } });
  },
  calcCumulativeVolume(buyPrice, precision) {
    const [quoteTokenSymbol, baseTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

    const cheaperOrders = Orders.find({
      isActive: true,
      'buy.price': { $lte: buyPrice },
      'buy.symbol': { $in: [quoteTokenSymbol, baseTokenSymbol] },
      'sell.symbol': { $in: [quoteTokenSymbol, baseTokenSymbol] },
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
  Meteor.call('orders.sync');
});

Template.orderbook_contents.events({});
