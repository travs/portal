import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { bootstrapSwitch } from 'bootstrap-switch';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import BigNumber from 'bignumber.js';
// Contracts
import contract from 'truffle-contract';
import VaultJson from '@melonproject/protocol/build/contracts/Vault.json'; // Get Smart Contract JSON
import ExchangeJson from '@melonproject/protocol/build/contracts/ExchangeProtocol.json';

import web3 from '/imports/lib/web3/client';
import addressList from '/imports/melon/interface/addressList';
// Collections
import Vaults from '/imports/api/vaults';
import Orders from '/imports/api/orders';
// specs
import specs from '/imports/melon/interface/helpers/specs';
// Interface
import getOrder from '/imports/melon/interface/getOrder';
import takeOrder from '/imports/melon/interface/takeOrder';

import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/preferences';
import './manageHoldings.html';


window.getOrder = getOrder;
window.takeOrder = takeOrder;
window.BigNumber = BigNumber;

const Vault = contract(VaultJson);
const Exchange = contract(ExchangeJson);

const numberOfQuoteTokens = specs.getQuoteTokens().length;
const numberOfBaseTokens = specs.getBaseTokens().length;
const assetPairs =
  [...Array(numberOfQuoteTokens * numberOfBaseTokens).keys()]
  .map((value, index) => [
    specs.getBaseTokens()[index % numberOfBaseTokens],
    '/',
    specs.getQuoteTokens()[index % numberOfQuoteTokens],
  ].join(''))
  .sort();


Template.manageHoldings.onCreated(() => {
  Meteor.subscribe('vaults');
  Template.instance().state = new ReactiveDict();
  Template.instance().state.set({ buyingSelected: true });
  // Creation of contract object
  Vault.setProvider(web3.currentProvider);
  Exchange.setProvider(web3.currentProvider);
});

const prefillTakeOrder = (id) => {
  const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
  const selectedOrderId = Number(Session.get('selectedOrderId'));
  const selectedOffer = Orders.find({ id: selectedOrderId }).fetch();
  const orderType = selectedOffer[0] && selectedOffer[0].sell.symbol === 'ETH-T' ? 'Sell' : 'Buy';

  if (orderType === 'Sell') {
    Template.instance().state.set('buyingSelected', false);
    let cheaperOrders;
    if (Session.get('fromPortfolio')) {
      cheaperOrders = Orders.find({
        isActive: true,
        'sell.symbol': quoteTokenSymbol,
        'buy.symbol': baseTokenSymbol,
        owner: addressList.liquidityProvider,
      }, { sort: { 'buy.price': -1, 'sell.howMuch': -1, createdAt: 1 } }).fetch();
    } else {
      cheaperOrders = Orders.find({
        isActive: true,
        'sell.symbol': quoteTokenSymbol,
        'buy.symbol': baseTokenSymbol,
      }, { sort: { 'buy.price': -1, 'sell.howMuch': -1, createdAt: 1 } }).fetch();
    }

    const buyTokenAddress = specs.getTokenAddress(baseTokenSymbol);
    const buyTokenPrecision = specs.getTokenPrecisionByAddress(buyTokenAddress);
    const sellTokenAddress = specs.getTokenAddress(quoteTokenSymbol);
    const sellTokenPrecision = specs.getTokenPrecisionByAddress(sellTokenAddress);

    const index = cheaperOrders.findIndex(element => element.id === parseInt(id, 10));
    const setOfOrders = cheaperOrders.slice(0, index + 1);
    const volumeTakeOrder = setOfOrders.reduce((accumulator, currentValue) =>
      accumulator.add(currentValue.buy.howMuchPrecise), new BigNumber(0));
    const pricesSum = setOfOrders.reduce((accumulator, currentValue) =>
      accumulator.add(currentValue.sell.howMuchPrecise), new BigNumber(0));
    const averagePrice = (pricesSum.div(volumeTakeOrder).div(Math.pow(10, sellTokenPrecision - buyTokenPrecision))).toString();
    const volume = volumeTakeOrder.div(Math.pow(10, buyTokenPrecision)).toString();
    const total = averagePrice * volume;
    const totalWantedBuyAmount = total;

    return { volume, averagePrice, total, setOfOrders, orderType, totalWantedBuyAmount };
  } else if (orderType === 'Buy') {
    Template.instance().state.set('buyingSelected', true);
    let cheaperOrders;
    if (Session.get('fromPortfolio')) {
      cheaperOrders = Orders.find({
        isActive: true,
        'sell.symbol': baseTokenSymbol,
        'buy.symbol': quoteTokenSymbol,
        owner: addressList.liquidityProvider,
      }, { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } }).fetch();
    } else {
      cheaperOrders = Orders.find({
        isActive: true,
        'sell.symbol': baseTokenSymbol,
        'buy.symbol': quoteTokenSymbol,
      }, { sort: { 'sell.price': 1, 'buy.howMuch': 1, createdAt: 1 } }).fetch();
    }

    const buyTokenAddress = specs.getTokenAddress(quoteTokenSymbol);
    const buyTokenPrecision = specs.getTokenPrecisionByAddress(buyTokenAddress);
    const sellTokenAddress = specs.getTokenAddress(baseTokenSymbol);
    const sellTokenPrecision = specs.getTokenPrecisionByAddress(sellTokenAddress);
    const index = cheaperOrders.findIndex(element => element.id === parseInt(id, 10));
    const setOfOrders = cheaperOrders.slice(0, index + 1);
    const volumeTakeOrder = setOfOrders.reduce((accumulator, currentValue) =>
      accumulator.add(currentValue.sell.howMuchPrecise), new BigNumber(0));
    const pricesSum = setOfOrders.reduce((accumulator, currentValue) =>
      accumulator.add(currentValue.buy.howMuchPrecise), new BigNumber(0));
    const averagePrice = (pricesSum.div(volumeTakeOrder).div(Math.pow(10, buyTokenPrecision - sellTokenPrecision))).toString();
    const volume = volumeTakeOrder.div(Math.pow(10, sellTokenPrecision)).toString();
    const total = averagePrice * volume;
    const totalWantedBuyAmount = volume;

    return { volume, averagePrice, total, setOfOrders, orderType, totalWantedBuyAmount };
  }
};

Template.manageHoldings.helpers({
  assetPairs,
  currentAssetPair: Session.get('currentAssetPair'),
  selected: assetPair => (assetPair === Session.get('currentAssetPair') ? 'selected' : ''),
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Vaults.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
  buyOrSell() {
    if (Template.instance().state.get('buyingSelected')) {
      return 'Buy';
    }
    return 'Sell';
  },
  isBuyingSelected: () => Template.instance().state.get('buyingSelected'),
  currentAssetPair: () => {
    if (Template.instance().state.get('buyingSelected')) {
      return Session.get('currentAssetPair');
    }
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    return `${quoteTokenSymbol}/${baseTokenSymbol}`;
  },
  priceAssetPair: () => {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    return `${quoteTokenSymbol}/${baseTokenSymbol}`;
  },
  volumeAsset: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],
  totalAsset: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  preFillType: () =>
    Session.get('selectedOrderId') !== null
    ? prefillTakeOrder(Session.get('selectedOrderId')).symbol
    : '',
  preFillPrice: () =>
    Session.get('selectedOrderId') !== null
    ? prefillTakeOrder(Session.get('selectedOrderId')).averagePrice
    : '',
  preFillVolume: () =>
    Session.get('selectedOrderId') !== null
    ? prefillTakeOrder(Session.get('selectedOrderId')).volume
    : '',
  preFillTotal: () =>
    Session.get('selectedOrderId') !== null
    ? prefillTakeOrder(Session.get('selectedOrderId')).total
    : '',
  getStatus() {
    if (Session.get('fromPortfolio')) return 'Manage fund';
    return 'Manage account';
  },
});

Template.manageHoldings.onRendered(() => {
  if (Session.get('fromPortfolio')) {
    $('.js-price').attr('readonly', true);
    $('#select_type').attr('disabled', true);
  }
  $('.js-from-portfolio').bootstrapSwitch({
    state: Session.get('fromPortfolio'),
    onSwitchChange(event, state) {
      Session.set('fromPortfolio', state);
      console.log(Session.get('fromPortfolio'));
      $('.js-price').attr('readonly') ? $('.js-price').removeAttr('readonly', false) : $('.js-price').attr('readonly', true);
      $('#select_type').attr('disabled') ? $('#select_type').removeAttr('disabled', false) : $('#select_type').attr('disabled', true);
    },
  });
});

Template.manageHoldings.events({
  'change .js-asset-pair-picker': (event) => {
    // Session.set('currentAssetPair', event.currentTarget.value);
    store.dispatch(creators.selectAssetPair(event.currentTarget.value));
    Meteor.subscribe('orders', event.currentTarget.value);
  },
  'change select#select_type': (event, templateInstance) => {
    const currentlySelectedTypeValue = parseFloat(templateInstance.find('select#select_type').value, 10);
    if (currentlySelectedTypeValue) Template.instance().state.set({ buyingSelected: false });
    else Template.instance().state.set({ buyingSelected: true });
  },
  'input input.js-price': (event, templateInstance) => {
    // by default, should insert the real time asset pair price
    const price = parseFloat(templateInstance.find('input.js-price').value, 10);
    const volume = parseFloat(templateInstance.find('input.js-volume').value, 10);
    const total = parseFloat(templateInstance.find('input.js-total').value, 10);
    if (!NaN(volume)) templateInstance.find('input.js-total').value = price * volume;
    else if (!isNaN(total)) templateInstance.find('input.js-volume').value = total / price;
  },
  'input input.js-volume': (event, templateInstance) => {
    const price = parseFloat(templateInstance.find('input.js-price').value, 10);
    const volume = parseFloat(templateInstance.find('input.js-volume').value, 10);
    if (Session.get('selectedOrderId') && volume > prefillTakeOrder(Session.get('selectedOrderId')).volume) {
      templateInstance.find('input.js-volume').value = prefillTakeOrder(Session.get('selectedOrderId')).volume;
    } else {
      templateInstance.find('input.js-total').value = price * volume;
    }
  },
  'input input.js-total': (event, templateInstance) => {
    const price = parseFloat(templateInstance.find('input.js-price').value, 10);
    const total = parseFloat(templateInstance.find('input.js-total').value, 10);
    templateInstance.find('input.js-volume').value = total / price;
  },
  'click .js-placeorder': (event, templateInstance) => {
    console.log('click .js-placeorder', event, templateInstance);
    event.preventDefault();

    window.scrollTo(0, 0);
    Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });

    const buy = Template.instance().state.get('buyingSelected');

    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

    const managerAddress = Session.get('selectedAccount');
    if (managerAddress === undefined) {
      // TODO replace toast
      // Materialize.toast('Not connected, use Parity, Mist or MetaMask', 4000, 'blue');
      return;
    }
    const coreAddress = FlowRouter.getParam('address');
    // const doc = Vaults.findOne({ address: coreAddress });
    // if (doc === undefined) {
    //   // TODO replace toast
    //   // Materialize.toast(`Portfolio could not be found\n ${coreAddress}`, 4000, 'red');
    //   return;
    // }
    const coreContract = Vault.at(coreAddress);
    const exchangeContract = Exchange.at(addressList.exchange);

    // BigNumber is always without decimal in it!
    // Good: '23452345'
    // Bad: '2.234235'

    // Case 1: form pre-filled w order book information (when user selects an order book)
    if (Session.get('selectedOrderId') !== null) {
      const setOfOrders = prefillTakeOrder(Session.get('selectedOrderId')).setOfOrders;
      // const totalWantedBuyAmount = prefillTakeOrder(Session.get('selectedOrderId')).totalWantedBuyAmount;

      // Get token address, precision and base unit volume for buy token and sell token
      const buyTokenAddress = specs.getTokenAddress(setOfOrders[0].sell.symbol);
      const buyTokenPrecision = specs.getTokenPrecisionByAddress(buyTokenAddress);
      // const buyBaseUnitVolume = totalWantedBuyAmount * Math.pow(10, buyTokenPrecision);
      const sellTokenAddress = specs.getTokenAddress(setOfOrders[0].buy.symbol);
      const sellTokenPrecision = specs.getTokenPrecisionByAddress(sellTokenAddress);

      const isSell = prefillTakeOrder(Session.get('selectedOrderId')).orderType === 'Sell';

      let quantity = 0;
      let quantityToApprove = 0; // will be used in case 1.2
      if (isSell) {
        quantity = new BigNumber(templateInstance.find('input.js-total').value)
          .times(Math.pow(10, buyTokenPrecision));
        quantityToApprove = new BigNumber(templateInstance.find('input.js-volume').value)
          .times(Math.pow(10, sellTokenPrecision));
      } else {
        quantity = new BigNumber(templateInstance.find('input.js-volume').value)
          .times(Math.pow(10, sellTokenPrecision));
        quantityToApprove = new BigNumber(templateInstance.find('input.js-total').value)
          .times(Math.pow(10, buyTokenPrecision));
      }
      // Case 1.1 : Take offer -> Trade through fund
      if (Session.get('fromPortfolio')) {
        for (let i = 0; i < setOfOrders.length; i += 1) {
          // const sellPrecision = setOfOrders[i].sell.precision;
          const sellHowMuchPrecise = new BigNumber(setOfOrders[i].sell.howMuchPrecise);
          // const buyHowMuchPrecise = new BigNumber(setOfOrders[i].buy.howMuchPrecise);

          if (quantity.toNumber()) {
            if (quantity.gte(sellHowMuchPrecise)) {
              takeOrder(
                setOfOrders[i].id,
                managerAddress,
                coreAddress,
                sellHowMuchPrecise,
              )
              .then((result) => {
                console.log('Transaction for order id ', setOfOrders[i].id, ' sent!', result);
                Session.get('selectedOrderId') !== null;
                Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
                toastr.success('Order successfully executed!');
              }).catch((err) => {
                Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: true, isMined: false });
                toastr.error('Oops, an error has occured. Please verify the transaction informations');
                throw err;
              });
              quantity = quantity.minus(sellHowMuchPrecise);
            } else if (quantity.lt(sellHowMuchPrecise)) {
              // Select more than one order
              // TODO: Check if its works!
              console.log(addressList.exchange, setOfOrders[i].id, quantity.toString(), { from: managerAddress });
              takeOrder(
                setOfOrders[i].id,
                managerAddress,
                coreAddress,
                quantity,
              )
              .then((result) => {
                console.log('Transaction for order id ', setOfOrders[i].id, ' executed!', result);
                Session.set('selectedOrderId', null);
                Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
                toastr.success('Order successfully executed!');
              }).catch((err) => {
                Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: true, isMined: false });
                toastr.error('Oops, an error has occured. Please verify the transaction informations');
                throw err;
              });
              quantity = new BigNumber(0);
            }
          }
        }
      } else {
        // Case 1.2 : Take offer -> Trade through manager's wallet
        // TODO: Implement this
        console.warn('Not implemented yet');
      }
    }
  },
});
