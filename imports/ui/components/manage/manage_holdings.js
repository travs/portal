import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { BigNumber } from 'meteor/ethereum:web3';
import contract from 'truffle-contract';
import constants from '/imports/lib/assets/utils/constants.js';
import CoreJson from '/imports/lib/assets/contracts/Core.json'; // Get Smart Contract JSON

import './manage_holdings.html';


const Core = contract(CoreJson);
Template.manage_holdings.onCreated(() => {
  Meteor.subscribe('cores');
  Template.instance().state = new ReactiveDict();
  Template.instance().state.set({ buyingSelected: true });
  // Creation of contract object
  Core.setProvider(web3.currentProvider);
});


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
  'selectedAssetPair': () => {
    if(Template.instance().state.get('buyingSelected')) {
      if(Session.get('selectedAssetPair')) return Session.get('selectedAssetPair');
      else if(!Session.get('selectedAssetPair')) return 'BTC/ETH';
    } else {
      if(Session.get('selectedAssetPair')) {
        const reversedPair = Session.get('selectedAssetPair').substring(4,7)+"/"+Session.get('selectedAssetPair').substring(0,3);
        return reversedPair;
      }
      else if(!Session.get('selectedAssetPair')) return 'ETH/BTC';
    }

  },
  'volumeAsset': () => {
    if(Session.get('selectedAssetPair')) return Session.get('selectedAssetPair').substring(0,3);
    else if(!Session.get('selectedAssetPair')) return 'BTC';
  },
  'totalAsset': () => {
    if(Session.get('selectedAssetPair')) return Session.get('selectedAssetPair').substring(4,7);
    else if(!Session.get('selectedAssetPair')) return 'ETH';
  }
});

Template.manage_holdings.onRendered(() => {});


Template.manage_holdings.events({
  'change select#select_type': (event, templateInstance) => {
    const currentlySelectedTypeValue = parseFloat(templateInstance.find('select#select_type').value, 10);
    if(currentlySelectedTypeValue) Template.instance().state.set({ buyingSelected: false });
    else Template.instance().state.set({ buyingSelected: true });
  },
  'input input.js-price': (event, templateInstance) => {
    //by default, should insert the real time asset pair price
    const price = parseFloat(templateInstance.find('input.js-price').value, 10);
    const volume = parseFloat(templateInstance.find('input.js-volume').value, 10);
    const total = parseFloat(templateInstance.find('input.js-total').value, 10);
    if(!isNaN(volume)) templateInstance.find('input.js-total').value = price * volume;
    else if(!isNaN(total)) templateInstance.find('input.js-volume').value = total / price;
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
    const type = Session.get(buyingSelected);
    const price = parseFloat(templateInstance.find('input.js-price').value, 10);
    const volume = parseFloat(templateInstance.find('input.js-volume').value, 10);
    const total = parseFloat(templateInstance.find('input.js-total').value, 10);
    if (isNaN(type) || isNaN(price) || isNaN(volume) || isNaN(total)) {
      //TODO replace toast
      // Materialize.toast('Please fill out the form', 4000, 'blue');
      alert('All fields are required.')
      return;
    }

    const managerAddress = Session.get('clientManagerAccount');
    if(managerAddress === undefined) {
      //TODO replace toast
      // Materialize.toast('Not connected, use Parity, Mist or MetaMask', 4000, 'blue');
      return;
    }

    const coreAddress = FlowRouter.getParal('address');
    const doc = Cores.findOne({ address: coreAddress });
    if (doc === undefined) {
      //TODO replace toast
      // Materialize.toast(`Portfolio could not be found\n ${coreAddress}`, 4000, 'red');
      return;
    }

    const coreContract = Core.at(coreAddress);

    // Is mining
    Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });

    const weiPrice = web3.toWei(price, 'ether'); //ether hardcoded
    const baseUnitVolume = web3.toWei(volume, 'ether');
    const weiTotal = web3.toWei(total, 'ether');



  }
});


