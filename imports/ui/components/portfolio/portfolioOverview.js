import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import BigNumber from 'bignumber.js';

// Smart contracts
import contract from 'truffle-contract';
import VaultJson from '@melonproject/protocol/build/contracts/Vault.json'; // Get Smart Contract JSON

import web3 from '/imports/lib/web3/client';
// Collections
import Vaults from '/imports/api/vaults';

import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/vault';

// Corresponding html file
import './portfolioOverview.html';

const Vault = contract(VaultJson); // Set Provider
Template.portfolioOverview.onCreated(() => {
  const template = Template.instance();
  Meteor.subscribe('vaults');
  Template.instance().totalShareAmount = new ReactiveVar();
  Template.instance().personalShareAmount = new ReactiveVar();
  // TODO send command to server to update current coreContract
  template.sharePrice = new ReactiveVar(0);
  store.subscribe(() => {
    const currentState = store.getState().vault;
    template.sharePrice.set(
      new BigNumber(currentState.sharePrice || 0).toString(),
    );
  });
  store.dispatch(creators.requestCalculations(FlowRouter.getParam('address')));
});

Template.portfolioOverview.helpers({
  // TODO implement cleaner
  getPersonalStake() {
    const template = Template.instance();
    const address = FlowRouter.getParam('address');
    Vault.setProvider(web3.currentProvider);
    const coreContract = Vault.at(address);
    coreContract
      .totalSupply()
      .then((result) => {
        template.totalShareAmount.set(result.toNumber());
        return coreContract.balanceOf(Session.get('selectedAccount'));
      })
      .then((result) => {
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
  getSharePrice() {
    const template = Template.instance();
    const finneySharePrice = (template.sharePrice.get() * 1000).toFixed(1);
    return finneySharePrice;
  },
});

Template.portfolioOverview.onRendered(() => {});

Template.portfolioOverview.events({
  'click .delete': () => {
    const address = FlowRouter.getParam('address');
    const doc = Vaults.findOne({ address });
    if (doc === undefined || address === undefined) {
      return false;
    }
    // TODO replace toast
    // Materialize.toast('Portfolio deleted!', 4000, 'blue');
    return true;
  },
});
