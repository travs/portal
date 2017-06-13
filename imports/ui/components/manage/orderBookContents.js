import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import BigNumber from 'bignumber.js';
// Collections
import Orders from '/imports/api/orders';
// Utils
import convertFromTokenPrecision from '/imports/melon/interface/helpers/convertFromTokenPrecision';

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
    (new BigNumber(numberPrecise)).div(Math.pow(10, precision)).toFixed(decimals),
  currentAssetPair: () => Session.get('currentAssetPair'),
  baseTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],
  quoteTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  buyOrders() {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    const liquidityProviderOrders = Orders.find({
      isActive: true,
      'buy.symbol': baseTokenSymbol,
      'sell.symbol': quoteTokenSymbol,
      owner: addressList.liquidityProvider,
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
    const sellBigNumber = new BigNumber(sellHowMuch);
    const buyBigNumber = new BigNumber(buyHowMuch);
    return sellBigNumber.div(buyBigNumber).div(Math.pow(10, sellPrecision - buyPrecision)).toFixed(4);
  },
  calcSellPrice(sellHowMuch, sellPrecision, buyHowMuch, buyPrecision) {
    const sellBigNumber = new BigNumber(sellHowMuch);
    const buyBigNumber = new BigNumber(buyHowMuch);
    return buyBigNumber.div(sellBigNumber).div(Math.pow(10, buyPrecision - sellPrecision)).toFixed(4);
  },
  sellOrders() {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    const liquidityProviderOrders = Orders.find({
      isActive: true,
      'buy.symbol': quoteTokenSymbol,
      'sell.symbol': baseTokenSymbol,
      owner: addressList.liquidityProvider,
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
        owner: addressList.liquidityProvider,
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
        owner: addressList.liquidityProvider,
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
    const currentCumVol = Template.orderBookContents.__helpers.get('calcBuyCumulativeVolume').call(this, buyPrice, precision, index);

    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    const total = Orders.find({
      isActive: true,
      'sell.symbol': quoteTokenSymbol,
      'buy.symbol': baseTokenSymbol,
    }, { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } })
    .fetch()
    .reduce((accumulator, currentValue) => accumulator + currentValue.buy.howMuch, 0);
    return (currentCumVol / convertFromTokenPrecision(total, precision)) * 100;
  },
  percentageOfSellSum(sellPrice, precision, index) {
    const currentCumVol = Template.orderBookContents.__helpers.get('calcSellCumulativeVolume').call(this, sellPrice, precision, index);

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

Template.orderBookContents.onRendered(() => {
});

Template.orderBookContents.events({
  'click .js-takeorder': (event) => {
    Session.set('selectedOrderId', event.currentTarget.dataset.id);
    console.log(Session.get('selectedOrderId'));
    location.hash = 'manage-holdings';
    history.replaceState(null, null, location.pathname);
  },
});
