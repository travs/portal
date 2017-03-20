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
});

Template.manage_holdings.onRendered(() => {});


Template.manage_holdings.events({
});
