import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import contract from 'truffle-contract';

import web3 from '/imports/lib/web3/client';
// Collections
import Cores from '/imports/api/cores';
// Smart contracts
import CoreJson from '/imports/melon/contracts/Core.json'; // Get Smart Contract JSON


// Corresponding html file
import './portfolioOverview.html';

const Core = contract(CoreJson); // Set Provider
Template.portfolioOverview.onCreated(() => {
  Meteor.subscribe('cores');
  Template.instance().totalShareAmount = new ReactiveVar();
  Template.instance().personalShareAmount = new ReactiveVar();
  // TODO send command to server to update current coreContract
});


Template.portfolioOverview.helpers({
  // TODO implement cleaner
  getPersonalStake() {
    const template = Template.instance();
    const address = FlowRouter.getParam('address');
    Core.setProvider(web3.currentProvider);
    const coreContract = Core.at(address);
    coreContract.totalSupply().then((result) => {
      template.totalShareAmount.set(result.toNumber());
      return coreContract.balanceOf(Session.get('selectedAccount'));
    }).then((result) => {
      template.personalShareAmount.set(result.toNumber());
    });
    return `${web3.fromWei(template.personalShareAmount.get(), 'ether')} of
      ${web3.fromWei(template.totalShareAmount.get(), 'ether')}`;
  },
  // TODO implement cleaner
  getShareAmount() {
    const template = Template.instance();
    return template.personalShareAmount.get();
  },
});


Template.portfolioOverview.onRendered(() => {});


Template.portfolioOverview.events({
  'click .delete': () => {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    if ((doc === undefined || address === undefined)) {
      return false;
    }
    Meteor.call('cores.removeById', doc._id);
    // TODO replace toast
    // Materialize.toast('Portfolio deleted!', 4000, 'blue');
    return true;
  },
});
