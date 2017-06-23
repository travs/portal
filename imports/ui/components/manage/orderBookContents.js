import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tracker } from 'meteor/tracker';
import BigNumber from 'bignumber.js';
// Collections
import Orders from '/imports/api/orders';
// Utils
import convertFromTokenPrecision from '/imports/melon/interface/helpers/convertFromTokenPrecision';
// Melon interface
import cumulativeVolume from '/imports/melon/interface/cumulativeVolume';
import matchOrders from '/imports/melon/interface/matchOrders';
import getPrices from '/imports/melon/interface/helpers/getPrices';
import filterByAssetPair from '/imports/melon/interface/query/filterByAssetPair';
import sortByPrice from '/imports/melon/interface/query/sortByPrice';
// Redux
import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/manageHoldings';

// Corresponding html file
import './orderBookContents.html';
import addressList from '/imports/melon/interface/addressList';

const getOrders = (orderType) => {
  const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---')
    .split('/');
  return Orders.find(filterByAssetPair(baseTokenSymbol, quoteTokenSymbol, orderType, true), {
    sort: sortByPrice('buy'),
  }).fetch();
};

Template.orderBookContents.onCreated(() => {
  Meteor.subscribe('orders', Session.get('currentAssetPair'));
  Template.instance().state = new ReactiveDict();
  const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---')
    .split('/');
  Template.instance().state.set({ baseTokenSymbol, quoteTokenSymbol });
});

Template.orderBookContents.helpers({
  convertFromTokenPrecision,
  more: false,
  displayBigNumber: (numberPrecise, precision, decimals) =>
    new BigNumber(numberPrecise).div(Math.pow(10, precision)).toFixed(decimals),
  currentAssetPair: () => Session.get('currentAssetPair'),
  baseTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],
  quoteTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  buyOrders() {
    return getOrders('buy');
  },
  sellOrders() {
    return getOrders('sell');
  },
  calcBuyPrice: order => getPrices(order).buy.toFixed(4),
  calcSellPrice: order => getPrices(order).sell.toFixed(4),
  displayVolume: (howMuch, dec) => howMuch.toFixed(dec),
  cumulativeVolume(order, orderType) {
    const orders = getOrders(orderType);
    const priceThreshold = getPrices(order)[orderType];
    const matchedOrders = matchOrders(orderType, priceThreshold, orders);
    return cumulativeVolume(orderType, matchedOrders).toNumber().toFixed(4);
  },
  percentageOfTotalVolume(order, orderType) {
    const orders = getOrders(orderType);
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
    // Session.set('selectedOrderId', event.currentTarget.dataset.id);
    store.dispatch(creators.selectOrder(event.currentTarget.dataset.id));

    location.hash = 'manage-holdings';
    history.replaceState(null, null, location.pathname);
  },
});
