import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { BigNumber } from 'meteor/ethereum:web3';
// Collections
import { CoreContracts } from '/imports/api/coreContracts';
// Contracts
import Core from '/imports/lib/assets/contracts/Core.sol.js';
import constants from '/imports/lib/assets/utils/constants.js';


import './manage_holdings.html';


Template.manage_holdings.onCreated(() => {
  Meteor.subscribe('coreContracts');
  Template.instance().state = new ReactiveDict();
  Template.instance().state.set({ investingSelected: true });
  // Creation of contract object
  Core.setProvider(web3.currentProvider);
});


Template.manage_holdings.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = CoreContracts.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
  isInvestingSelected() {
    if (Template.instance().state.get('investingSelected')) {
      return 'invest';
    }
    return 'redeem';
  },
});

Template.manage_holdings.onRendered(() => {
  this.$('select').material_select();
});


Template.manage_holdings.events({
});
