import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
// Collections
import { Cores } from '/imports/api/cores';
// Smart contracts
import contract from 'truffle-contract';
import CoreJson from '/imports/lib/assets/contracts/Core.json'; // Get Smart Contract JSON


// Corresponding html file
import './portfolio_overview.html';

const Core = contract(CoreJson); // Set Provider
Core.setProvider(web3.currentProvider);
Template.portfolio_overview.onCreated(() => {
  Meteor.subscribe('cores');
  Template.instance().totalShareAmount = new ReactiveVar();
  Template.instance().personalShareAmount = new ReactiveVar();
  // TODO send command to server to update current coreContract
});


Template.portfolio_overview.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
  // TODO implement cleaner
  getPersonalStake() {
    const template = Template.instance();
    const address = FlowRouter.getParam('address');
    const coreContract = Core.at(address);
    coreContract.totalSupply().then((result) => {
      template.totalShareAmount.set(result.toNumber());
      return coreContract.balanceOf(Session.get('clientManagerAccount'));
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


Template.portfolio_overview.onRendered(() => {});


Template.portfolio_overview.events({
  'click .delete': () => {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    if ((doc === undefined || address === undefined)) {
      return false;
    }
    Meteor.call('cores.remove', doc._id);
    //TODO replace toast
    // Materialize.toast('Portfolio deleted!', 4000, 'blue');
    return true;
  },
});
