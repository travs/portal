import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { bootstrapSwitch } from 'bootstrap-switch';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
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
import getPrices from '/imports/melon/interface/helpers/getPrices';
// query
import filterByAssetPair from '/imports/melon/interface/query/filterByAssetPair';

// Interface
import matchOrders from '/imports/melon/interface/matchOrders';
import takeMultipleOrders from '/imports/melon/interface/takeMultipleOrders';

import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/manageHoldings';

import './manageHoldings.html';

const Vault = contract(VaultJson);
const Exchange = contract(ExchangeJson);

const numberOfQuoteTokens = specs.getQuoteTokens().length;
const numberOfBaseTokens = specs.getBaseTokens().length;
const assetPairs = [...Array(numberOfQuoteTokens * numberOfBaseTokens).keys()]
  .map((value, index) =>
    [
      specs.getBaseTokens()[index % numberOfBaseTokens],
      '/',
      specs.getQuoteTokens()[index % numberOfQuoteTokens],
    ].join(''),
  )
  .sort();

Template.manageHoldings.onCreated(() => {
  Meteor.subscribe('vaults');
  const template = Template.instance();
  template.state = new ReactiveDict();
  template.state.set({ buyingSelected: true });
  // Creation of contract object
  Vault.setProvider(web3.currentProvider);
  Exchange.setProvider(web3.currentProvider);

  store.subscribe(() => {
    const currentState = store.getState().manageHoldings;
    template.state.set({
      ...currentState,
    });
  });
});

Template.manageHoldings.helpers({
  assetPairs,
  currentAssetPair: Session.get('currentAssetPair'),
  selected: assetPair => (assetPair === Session.get('currentAssetPair') ? 'selected' : ''),
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Vaults.findOne({ address });
    return doc === undefined || address === undefined ? '' : doc;
  },
  orderType: () => (Template.instance().state.get('theirOrderType') === 'buy' ? 'sell' : 'buy'),
  isBuyingSelected: () => Template.instance().state.get('theirOrderType') !== 'buy',
  currentAssetPair: () => {
    if (Template.instance().state.get('buyingSelected')) {
      return Session.get('currentAssetPair');
    }
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---')
      .split('/');
    return `${quoteTokenSymbol}/${baseTokenSymbol}`;
  },
  priceAssetPair: () => {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---')
      .split('/');
    return `${quoteTokenSymbol}/${baseTokenSymbol}`;
  },
  volumeAsset: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],
  totalAsset: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  preFillPrice: () => Template.instance().state.get('averagePrice'),
  preFillVolume: () => Template.instance().state.get('volume'),
  preFillTotal: () => Template.instance().state.get('total'),
  preFillVolumeMax: () => Template.instance().state.get('maxVolume'),
  preFillTotalMax: () => Template.instance().state.get('maxTotal'),
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
      $('.js-price').attr('readonly')
        ? $('.js-price').removeAttr('readonly', false)
        : $('.js-price').attr('readonly', true);
      $('#select_type').attr('disabled')
        ? $('#select_type').removeAttr('disabled', false)
        : $('#select_type').attr('disabled', true);
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
    const currentlySelectedTypeValue = parseFloat(
      templateInstance.find('select#select_type').value,
      10,
    );
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
    store.dispatch(creators.changeVolume(event.currentTarget.value));
  },
  'input input.js-total': (event, templateInstance) => {
    store.dispatch(creators.changeTotal(event.currentTarget.value));
  },
  'click .js-placeorder': async (event, templateInstance) => {
    event.preventDefault();
    if(Template.instance().state.get('selectedOrderId') !== undefined) {
      window.scrollTo(0, 0);
      Session.set('NetworkStatus', {
        isInactive: false,
        isMining: true,
        isError: false,
        isMined: false,
      });

      const managerAddress = Session.get('selectedAccount');
      if (managerAddress === undefined) {
        // TODO replace toast
        // Materialize.toast('Not connected, use Parity, Mist or MetaMask', 4000, 'blue');
        return;
      }
      const coreAddress = FlowRouter.getParam('address');

      const theirOrderType = Template.instance().state.get('theirOrderType');
      const ourOrderType = Template.instance().state.get('theirOrderType') === 'sell'
        ? 'buy'
        : 'sell';
      const selectedOrderId = Template.instance().state.get('selectedOrderId');
      const selectedOrder = Orders.findOne({ id: selectedOrderId });
      const priceTreshold = getPrices(selectedOrder)[theirOrderType];
      const currentAssetPair = Template.instance().state.get('currentAssetPair');
      const orders = Orders.find(
        filterByAssetPair(
          currentAssetPair.baseTokenSymbol,
          currentAssetPair.quoteTokenSymbol,
          theirOrderType,
          true,
        ),
      ).fetch();

      const matchedOrders = matchOrders(theirOrderType, priceTreshold, orders);

      const quantityAsked = ourOrderType === 'buy'
        ? Template.instance().state.get('volume')
        : Template.instance().state.get('total');

      try {
        await takeMultipleOrders(matchedOrders, managerAddress, coreAddress, quantityAsked);
        Session.get('selectedOrderId') !== null;
        Session.set('NetworkStatus', {
          isInactive: false,
          isMining: false,
          isError: false,
          isMined: true,
        });
        toastr.success('Order successfully executed!');
      } catch (e) {
        console.error(e);
        Session.set('NetworkStatus', {
          isInactive: false,
          isMining: false,
          isError: true,
          isMined: false,
        });
        toastr.error('Oops, an error has occurred. Please verify the transaction informations');
      }
    } else {
      toastr.error('Oops, you need to select an order from the order book!');
    }
  },
});
