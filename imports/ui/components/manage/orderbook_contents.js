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
    const liquidityProviderOrders = Orders.find({
      isActive: true,
      'buy.symbol': baseTokenSymbol,
      'sell.symbol': quoteTokenSymbol,
      owner: '0x00e0b33cdb3af8b55cd8467d6d13bc0ba8035acf',
    }, { sort: { 'buy.price': -1, 'buy.howMuch': 1, createdAt: 1 } });
    const allOrders = Orders.find({
      isActive: true,
      'buy.symbol': baseTokenSymbol,
      'sell.symbol': quoteTokenSymbol,
    }, { sort: { 'buy.price': -1, 'buy.howMuch': 1, createdAt: 1 } });
    if (Session.get('fromPortfolio')) return liquidityProviderOrders;
    else if (!Session.get('fromPortfolio')) return allOrders;
  },
  calcBuyPrice(sellHowMuch, sellPrecision, buyHowMuch, buyPrecision) {
    return (convertFromTokenPrecision(sellHowMuch, sellPrecision) / convertFromTokenPrecision(buyHowMuch, buyPrecision)).toFixed(4);
  },
  calcSellPrice(sellHowMuch, sellPrecision, buyHowMuch, buyPrecision) {
    return (convertFromTokenPrecision(buyHowMuch, buyPrecision) / convertFromTokenPrecision(sellHowMuch, sellPrecision)).toFixed(4);
  },
  sellOrders() {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    const liquidityProviderOrders = Orders.find({
      isActive: true,
      'buy.symbol': quoteTokenSymbol,
      'sell.symbol': baseTokenSymbol,
      owner: '0x00e0b33cdb3af8b55cd8467d6d13bc0ba8035acf',
    }, { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } });
    const allOrders = Orders.find({
      isActive: true,
      'buy.symbol': quoteTokenSymbol,
      'sell.symbol': baseTokenSymbol,
    }, { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } });

    if (Session.get('fromPortfolio')) return liquidityProviderOrders;
    else if (!Session.get('fromPortfolio')) return allOrders;
  },
  calcBuyCumulativeVolume(buyPrice, precision, index) {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    let cheaperOrders;

    if (Session.get('fromPortfolio')) {
      cheaperOrders = Orders.find({
        isActive: true,
        'buy.price': { $gte: buyPrice },
        'buy.symbol': baseTokenSymbol,
        'sell.symbol': quoteTokenSymbol,
        owner: '0x00e0b33cdb3af8b55cd8467d6d13bc0ba8035acf',
      }, { sort: { 'buy.price': -1, 'buy.howMuch': 1, createdAt: 1 } }).fetch();
    } else {
      cheaperOrders = Orders.find({
        isActive: true,
        'buy.price': { $gte: buyPrice },
        'buy.symbol': baseTokenSymbol,
        'sell.symbol': quoteTokenSymbol,
      }, { sort: { 'buy.price': -1, 'buy.howMuch': 1, createdAt: 1 } }).fetch();
    }
    let cumulativeDouble = 0;

    for (let i = 0; i <= index; i += 1) {
      cumulativeDouble += cheaperOrders[i].buy.howMuch;
    }

    return convertFromTokenPrecision(cumulativeDouble, precision);
  },
  calcSellCumulativeVolume(sellPrice, precision, index) {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    let cheaperOrders;
    if (Session.get('fromPortfolio')) {
      cheaperOrders = Orders.find({
        isActive: true,
        'sell.price': { $lte: sellPrice },
        'sell.symbol': baseTokenSymbol,
        'buy.symbol': quoteTokenSymbol,
        owner: '0x00e0b33cdb3af8b55cd8467d6d13bc0ba8035acf',
      }, { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } }).fetch();
    } else {
      cheaperOrders = Orders.find({
        isActive: true,
        'sell.price': { $lte: sellPrice },
        'sell.symbol': baseTokenSymbol,
        'buy.symbol': quoteTokenSymbol,
      }, { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } }).fetch();
    }

    let cumulativeDouble = 0;

    for (let i = 0; i <= index; i += 1) {
      cumulativeDouble += cheaperOrders[i].sell.howMuch;
    }

    return convertFromTokenPrecision(cumulativeDouble, precision);
  },
  percentageOfBuySum(buyPrice, precision, index) {
    const currentCumVol = Template.orderbook_contents.__helpers.get('calcBuyCumulativeVolume').call(this, buyPrice, precision, index);

    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    const total = Orders.find({
      isActive: true,
      'sell.symbol': quoteTokenSymbol,
      'buy.symbol': baseTokenSymbol,
    }, { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } })
    .fetch()
    .reduce((accumulator, currentValue) => accumulator + currentValue.buy.howMuch, 0);

    // console.log({
    //   currentCumVol,
    //   totalConverted: convertFromTokenPrecision(total, precision),
    //   ratio: (currentCumVol / convertFromTokenPrecision(total, precision)),
    // });
    return (currentCumVol / convertFromTokenPrecision(total, precision)) * 100;
  },
  percentageOfSellSum(sellPrice, precision, index) {
    const currentCumVol = Template.orderbook_contents.__helpers.get('calcSellCumulativeVolume').call(this, sellPrice, precision, index);

    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    const total = Orders.find({
      isActive: true,
      'sell.symbol': baseTokenSymbol,
      'buy.symbol': quoteTokenSymbol,
    }, { sort: { 'buy.price': 1, 'sell.howMuch': 1, createdAt: 1 } })
    .fetch()
    .reduce((accumulator, currentValue) => accumulator + currentValue.sell.howMuch, 0);

    return (currentCumVol / convertFromTokenPrecision(total, precision)) * 100;
  },
});

Template.orderbook_contents.onRendered(() => {
  // Meteor.call('orders.sync');
});

Template.orderbook_contents.events({
  'click .js-takeorder': (event) => {
    Session.set('selectedOrderId', event.currentTarget.dataset.id);
    console.log(Session.get('selectedOrderId'));
    location.hash = 'manage-holdings';
    history.replaceState(null, null, location.pathname);
  },
});
