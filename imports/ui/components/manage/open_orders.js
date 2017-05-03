// Meteor imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
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
  quoteTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],
  baseTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  getOpenOrders() {
    const [quoteTokenSymbol, baseTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    const owner = '0x00e0b33cdb3af8b55cd8467d6d13bc0ba8035acf';

    // const address = FlowRouter.getParam('address'); <-- portfolio

    return Orders.find({
      owner,
      isActive: true,
      $or: [
        { 'buy.symbol': { $in: [quoteTokenSymbol, baseTokenSymbol] } },
        { 'sell.symbol': { $in: [quoteTokenSymbol, baseTokenSymbol] } },
      ],
    });
  },
  buyOrSell: buyTokenSymbol =>
    (buyTokenSymbol === (Session.get('currentAssetPair') || '---/---').split('/')[1]
    ? 'buy' : 'sell'
  ),
  getPrice(order) {
    const baseTokenSymbol = (Session.get('currentAssetPair') || '---/---')[1];
    const details = order.buy.symbol === baseTokenSymbol
      ? order.buy : order.sell;

    return details.price;
  },
  getVolume(order) {
    const baseTokenSymbol = (Session.get('currentAssetPair') || '---/---')[1];
    const details = order.buy.symbol === baseTokenSymbol
      ? order.buy : order.sell;

    return convertFromTokenPrecision(details.howMuch, details.precision);
  },
  formatDate: date => moment(date).format('D.M.YYYY HH:mm:ss'),
});

Template.open_orders.onRendered(() => {});

Template.open_orders.events({});
