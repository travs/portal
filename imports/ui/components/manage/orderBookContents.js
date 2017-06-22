import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import BigNumber from 'bignumber.js';
// Collections
import Orders from '/imports/api/orders';
// Utils
import convertFromTokenPrecision from '/imports/melon/interface/helpers/convertFromTokenPrecision';
// Melon interface
import cumulativeVolume from '/imports/melon/interface/cumulativeVolume';
import matchOrders from '/imports/melon/interface/matchOrders';
import getOrders from '/imports/melon/interface/getOrders';
import getPrices from '/imports/melon/interface/helpers/getPrices';
import filterByAssetPair from '/imports/melon/interface/query/filterByAssetPair';
import sortByPrice from '/imports/melon/interface/query/sortByPrice';

// Corresponding html file
import './orderBookContents.html';
import addressList from '/imports/melon/interface/addressList';

Template.orderBookContents.onCreated(() => {
  Meteor.subscribe('orders', Session.get('currentAssetPair'));
});

Template.orderBookContents.helpers({
  convertFromTokenPrecision,
  more: false,
  displayBigNumber: (numberPrecise, precision, decimals) =>
    new BigNumber(numberPrecise).div(Math.pow(10, precision)).toFixed(decimals),
  currentAssetPair: () => Session.get('currentAssetPair'),
  baseTokenSymbol: () =>
    (Session.get('currentAssetPair') || '---/---').split('/')[0],
  quoteTokenSymbol: () =>
    (Session.get('currentAssetPair') || '---/---').split('/')[1],
  buyOrders() {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get(
      'currentAssetPair',
    ) || '---/---')
      .split('/');
    return Orders.find(filterByAssetPair(baseTokenSymbol, quoteTokenSymbol, 'buy', true), { sort: sortByPrice('buy') });
  },
  sellOrders() {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get(
      'currentAssetPair',
    ) || '---/---')
      .split('/');
    return Orders.find(filterByAssetPair(baseTokenSymbol, quoteTokenSymbol, 'sell', true), { sort: sortByPrice('sell') });
  },
  calcBuyPrice: order => getPrices(order).buy.toFixed(4),
  calcSellPrice: order => getPrices(order).sell.toFixed(4),
  displayVolume: (howMuch, dec) => howMuch.toFixed(dec),
  cumulativeVolume(order, orderType) {
    const orders = getOrders(orderType, Session.get('currentAssetPair'));
    const priceThreshold = getPrices(order)[orderType];
    const matchedOrders = matchOrders(orderType, priceThreshold, orders);
    return cumulativeVolume(orderType, matchedOrders).toNumber().toFixed(4);
  },
  percentageOfTotalVolume(order, orderType) {
    const orders = getOrders(orderType, Session.get('currentAssetPair'));
    const priceThreshold = getPrices(order)[orderType];
    const matchedOrders = matchOrders(orderType, priceThreshold, orders);
    const currentCumulativeVolume = cumulativeVolume(orderType, matchedOrders);
    const totalCumulativeVolume = cumulativeVolume(orderType, orders);

    return currentCumulativeVolume.div(totalCumulativeVolume).times(100);
  },
});

Template.orderBookContents.onRendered(() => {});

Template.orderBookContents.events({
  'click .js-takeorder': (event) => {
    Session.set('selectedOrderId', event.currentTarget.dataset.id);
    console.log(Session.get('selectedOrderId'));
    location.hash = 'manage-holdings';
    history.replaceState(null, null, location.pathname);
  },
});
