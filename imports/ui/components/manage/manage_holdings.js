import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { BigNumber } from 'meteor/ethereum:web3';
import AddressList from '/imports/lib/ethereum/address_list.js';
import constants from '/imports/lib/assets/utils/constants.js';
import Specs from '/imports/lib/assets/utils/specs.js';
// Collections
import { Cores } from '/imports/api/cores';
import { Orders } from '/imports/api/orders.js';
// Contracts
import contract from 'truffle-contract';
import CoreJson from '/imports/lib/assets/contracts/Core.json'; // Get Smart Contract JSON
import ExchangeJson from '/imports/lib/assets/contracts/ExchangeProtocol.json';
import AssetJson from '/imports/lib/assets/contracts/AssetProtocol.json';
// Utils
import { convertFromTokenPrecision } from '/imports/lib/assets/utils/functions.js';

import './manage_holdings.html';

const Core = contract(CoreJson);


Template.manage_holdings.onCreated(() => {
  Meteor.subscribe('cores');
  Template.instance().state = new ReactiveDict();
  Template.instance().state.set({ buyingSelected: true });
  // Creation of contract object
  Core.setProvider(web3.currentProvider);
});

const prefillTakeOrder = (id) => {
  const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
  const cheaperOrders = Orders.find({
    isActive: true,
    'buy.symbol': baseTokenSymbol,
    'sell.symbol': quoteTokenSymbol,
  }, { sort: { 'buy.price': 1, 'buy.howMuch': 1, createdAt: 1 } }).fetch();

  const index = cheaperOrders.findIndex(element => element.id === parseInt(id));

  const setOfOrders = cheaperOrders.slice(0, index + 1);

  console.log({ id, index, setOfOrders });

  const volumeTakeOrder = setOfOrders.reduce((accumulator, currentValue) =>
    accumulator + currentValue.buy.howMuch, 0);

  const averagePrice = setOfOrders.reduce((accumulator, currentValue) =>
    accumulator + currentValue.buy.howMuch * currentValue.buy.price, 0) / volumeTakeOrder;

  const buyTokenAddress = Specs.getTokenAddress(baseTokenSymbol);
  const buyTokenPrecision = Specs.getTokenPrecisionByAddress(buyTokenAddress);
  // const sellTokenAddress = Specs.getTokenAddress(quoteTokenSymbol);
  // const sellTokenPrecision = Specs.getTokenPrecisionByAddress(sellTokenAddress);

  // console.log('volumeTakeOrder', volumeTakeOrder);
  const volume = convertFromTokenPrecision(volumeTakeOrder, buyTokenPrecision);
  // const price = convertFromTokenPrecision(averagePrice, sellTokenPrecision);
  const total = averagePrice * volume;
  // console.log({ volume, averagePrice, total, setOfOrders });

  return { volume, averagePrice, total };
};

Template.manage_holdings.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
  isBuyingSelected() {
    if (Template.instance().state.get('buyingSelected')) {
      return 'Buy';
    }
    return 'Sell';
  },
  currentAssetPair: () => {
    if (Template.instance().state.get('buyingSelected')) {
      return Session.get('currentAssetPair');
    }
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    return `${quoteTokenSymbol}/${baseTokenSymbol}`;
  },
  priceAssetPair: () => {
    // TODO: Check if we need to swap for buy/sell button
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    return `${quoteTokenSymbol}/${baseTokenSymbol}`;
  },

  // TODO: Check if needs to swap for buy/sell button also
  volumeAsset: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],

  totalAsset: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  preFillType: () => {
    if (Session.get('selectedOrderId') !== null) {
      return 'Buy'; // TODO
    }
  },
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
});

Template.manage_holdings.onRendered(() => {});


Template.manage_holdings.events({
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
    if (!isNaN(volume)) templateInstance.find('input.js-total').value = price * volume;
    else if (!isNaN(total)) templateInstance.find('input.js-volume').value = total / price;
  },
  'input input.js-volume': (event, templateInstance) => {
    const price = parseFloat(templateInstance.find('input.js-price').value, 10);
    const volume = parseFloat(templateInstance.find('input.js-volume').value, 10);
    templateInstance.find('input.js-total').value = price * volume;
  },
  'input input.js-total': (event, templateInstance) => {
    const price = parseFloat(templateInstance.find('input.js-price').value, 10);
    const total = parseFloat(templateInstance.find('input.js-total').value, 10);
    templateInstance.find('input.js-volume').value = total / price;
  },
  'click .js-placeorder': (event, templateInstance) => {
    event.preventDefault();

    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

    if (Session.get('selectedOrderId') !== null) {
      console.log('HERE', prefillTakeOrder(Session.get('selectedOrderId')));
      console.log(prefillTakeOrder(Session.get('selectedOrderId')).setOfOrders);
      // const setOfOrders = prefillTakeOrder(Session.get('selectedOrderId')).setOfOrders;
      // for(let i=0 ; i < setOfOrders.length ; i++) {
      //   coreContract
      // }
    } else {
      const type = Template.instance().state.get('buyingSelected') ? 'Buy' : 'Sell';
      const price = parseFloat(templateInstance.find('input.js-price').value, 10);
      const volume = parseFloat(templateInstance.find('input.js-volume').value, 10);
      const total = parseFloat(templateInstance.find('input.js-total').value, 10);
      if (!type || isNaN(price) || isNaN(volume) || isNaN(total)) {
      // TODO replace toast
      // Materialize.toast('Please fill out the form', 4000, 'blue');
        alert('All fields are required.');
        return;
      }

      const managerAddress = Session.get('clientManagerAccount');
      if (managerAddress === undefined) {
      // TODO replace toast
      // Materialize.toast('Not connected, use Parity, Mist or MetaMask', 4000, 'blue');
        return;
      }

      const coreAddress = FlowRouter.getParam('address');
      const doc = Cores.findOne({ address: coreAddress });
      if (doc === undefined) {
      // TODO replace toast
      // Materialize.toast(`Portfolio could not be found\n ${coreAddress}`, 4000, 'red');
        return;
      }

      // Is mining
      Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });

      let sellToken;
      let buyToken;
      let sellVolume;
      let buyVolume;

      if (type === 'Buy') {
        sellToken = quoteTokenSymbol;
        sellVolume = total;
        buyToken = baseTokenSymbol;
        buyVolume = volume;
      } else if (type === 'Sell') {
        sellToken = baseTokenSymbol;
        sellVolume = total;
        buyToken = quoteTokenSymbol;
        buyVolume = volume;
      }

    // Get token addresses
      const sellTokenAddress = Specs.getTokenAddress(sellToken);
      const buyTokenAddress = Specs.getTokenAddress(buyToken);
    // Get token precision
      const sellTokenPrecision = Specs.getTokenPrecisionByAddress(sellTokenAddress);
      const buyTokenPrecision = Specs.getTokenPrecisionByAddress(buyTokenAddress);
    // Get base unit volume
      const sellBaseUnitVolume = sellVolume * Math.pow(10, sellTokenPrecision);
      const buyBaseUnitVolume = buyVolume * Math.pow(10, buyTokenPrecision);

      const coreContract = Core.at(coreAddress);
      const Asset = contract(AssetJson);
      Asset.setProvider(web3.currentProvider);
      const assetContract = Asset.at(sellTokenAddress);

      coreContract.makeOrder(
        AddressList.Exchange,
        sellBaseUnitVolume,
        sellTokenAddress,
        buyBaseUnitVolume,
        buyTokenAddress,
        { from: managerAddress }
      ).then((result) => {
        console.log(result);
        // Check Logs
        console.log('Make Order Content');
        for (let i = 0; i < result.logs.length; i += 1) {
          if (result.logs[i].event === 'OrderUpdate') {
            console.log(`Order id: ${result.logs[i].args.id.toNumber()}`);
            Meteor.call('orders.upsert', result.logs[i].args.id.toNumber());
            console.log('Order registered');
          }
        }
      }).catch((err) => { throw err; });
    }
  },
});
