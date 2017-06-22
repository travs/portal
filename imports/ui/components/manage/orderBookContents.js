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
    const liquidityProviderOrders = Orders.find(
      {
        isActive: true,
        'buy.symbol': baseTokenSymbol,
        'sell.symbol': quoteTokenSymbol,
        owner: addressList.liquidityProvider,
      },
      { sort: { 'buy.price': -1, 'buy.howMuch': 1, createdAt: 1 } },
    );
    const allOrders = Orders.find(
      {
        isActive: true,
        'buy.symbol': baseTokenSymbol,
        'sell.symbol': quoteTokenSymbol,
      },
      { sort: { 'buy.price': -1, 'buy.howMuch': 1, createdAt: 1 } },
    );
    if (Session.get('fromPortfolio')) return liquidityProviderOrders;
    else if (!Session.get('fromPortfolio')) return allOrders;
  },
  calcBuyPrice: order => getPrices(order).buy.toFixed(4),
  calcSellPrice: order => getPrices(order).sell.toFixed(4),
  displayVolume: (howMuch, dec) => howMuch.toFixed(dec),
  sellOrders() {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get(
      'currentAssetPair',
    ) || '---/---')
      .split('/');
    const liquidityProviderOrders = Orders.find(
      {
        isActive: true,
        'buy.symbol': quoteTokenSymbol,
        'sell.symbol': baseTokenSymbol,
        owner: addressList.liquidityProvider,
      },
      { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } },
    );
    const allOrders = Orders.find(
      {
        isActive: true,
        'buy.symbol': quoteTokenSymbol,
        'sell.symbol': baseTokenSymbol,
      },
      { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } },
    );

    if (Session.get('fromPortfolio')) return liquidityProviderOrders;
    else if (!Session.get('fromPortfolio')) return allOrders;
  },
  calcBuyCumulativeVolume(buyPrice, precision, index) {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get(
      'currentAssetPair',
    ) || '---/---')
      .split('/');
    let cheaperOrders;

    if (Session.get('fromPortfolio')) {
      cheaperOrders = Orders.find(
        {
          isActive: true,
          'buy.price': { $gte: buyPrice },
          'buy.symbol': baseTokenSymbol,
          'sell.symbol': quoteTokenSymbol,
          owner: addressList.liquidityProvider,
        },
        { sort: { 'buy.price': -1, 'buy.howMuch': 1, createdAt: 1 } },
      ).fetch();
    } else {
      cheaperOrders = Orders.find(
        {
          isActive: true,
          'buy.price': { $gte: buyPrice },
          'buy.symbol': baseTokenSymbol,
          'sell.symbol': quoteTokenSymbol,
        },
        { sort: { 'buy.price': -1, 'buy.howMuch': 1, createdAt: 1 } },
      ).fetch();
    }
    let cumulativeDouble = 0;

    for (let i = 0; i <= index; i += 1) {
      cumulativeDouble += cheaperOrders[i].buy.howMuch;
    }

    return convertFromTokenPrecision(cumulativeDouble, precision);
  },
  calcSellCumulativeVolume(sellPrice, precision, index) {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get(
      'currentAssetPair',
    ) || '---/---')
      .split('/');
    let cheaperOrders;
    if (Session.get('fromPortfolio')) {
      cheaperOrders = Orders.find(
        {
          isActive: true,
          'sell.price': { $lte: sellPrice },
          'sell.symbol': baseTokenSymbol,
          'buy.symbol': quoteTokenSymbol,
          owner: addressList.liquidityProvider,
        },
        { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } },
      ).fetch();
    } else {
      cheaperOrders = Orders.find(
        {
          isActive: true,
          'sell.price': { $lte: sellPrice },
          'sell.symbol': baseTokenSymbol,
          'buy.symbol': quoteTokenSymbol,
        },
        { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } },
      ).fetch();
    }

    let cumulativeDouble = 0;

    for (let i = 0; i <= index; i += 1) {
      cumulativeDouble += cheaperOrders[i].sell.howMuch;
    }

    return convertFromTokenPrecision(cumulativeDouble, precision);
  },
  percentageOfBuySum(buyPrice, precision, index) {
    const currentCumVol = Template.orderBookContents.__helpers
      .get('calcBuyCumulativeVolume')
      .call(this, buyPrice, precision, index);

    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get(
      'currentAssetPair',
    ) || '---/---')
      .split('/');
    const total = Orders.find(
      {
        isActive: true,
        'sell.symbol': quoteTokenSymbol,
        'buy.symbol': baseTokenSymbol,
      },
      { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } },
    )
      .fetch()
      .reduce(
        (accumulator, currentValue) => accumulator + currentValue.buy.howMuch,
        0,
      );
    return currentCumVol / convertFromTokenPrecision(total, precision) * 100;
  },
  percentageOfSellSum(sellPrice, precision, index) {
    const currentCumVol = Template.orderBookContents.__helpers
      .get('calcSellCumulativeVolume')
      .call(this, sellPrice, precision, index);

    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get(
      'currentAssetPair',
    ) || '---/---')
      .split('/');
    const total = Orders.find(
      {
        isActive: true,
        'sell.symbol': baseTokenSymbol,
        'buy.symbol': quoteTokenSymbol,
      },
      { sort: { 'buy.price': 1, 'sell.howMuch': 1, createdAt: 1 } },
    )
      .fetch()
      .reduce(
        (accumulator, currentValue) => accumulator + currentValue.sell.howMuch,
        0,
      );

    return currentCumVol / convertFromTokenPrecision(total, precision) * 100;
  },
  cumulativeVolume(order, orderType) {
    const orders = getOrders(orderType, Session.get('currentAssetPair'));
    const priceThreshold = getPrices(order)[orderType];
    const matchedOrders = matchOrders(orderType, priceThreshold, orders);
    return cumulativeVolume(orderType, matchedOrders).toNumber();
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
