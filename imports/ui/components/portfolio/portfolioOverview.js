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
  template.totalShareAmount = new ReactiveVar(0);
  template.personalShareAmount = new ReactiveVar(0);
  template.personalStakeValue = new ReactiveVar(0);
  template.sharePrice = new ReactiveVar(0);
  store.subscribe(() => {
    const currentState = store.getState().vault;
    template.sharePrice.set(
      new BigNumber(currentState.sharePrice || 0).toString(),
    );
    template.totalShareAmount.set(
      new BigNumber(currentState.totalSupply || 0).toString(),
    );
    template.personalShareAmount.set(
      new BigNumber(currentState.personalStake || 0).toString(),
    );
    template.personalStakeValue.set(
      Number(template.personalShareAmount.get()) *
        Number(template.sharePrice.get()),
    );
  });
  const managerAddress = Session.get('selectedAccount');
  const vaultAddress = FlowRouter.getParam('address');
  store.dispatch(creators.requestCalculations(vaultAddress));
  store.dispatch(creators.requestParticipation(vaultAddress, managerAddress));
});

Template.portfolioOverview.helpers({
  getPersonalStake() {
    const template = Template.instance();
    return `${template.personalShareAmount.get()} of
      ${template.totalShareAmount.get()}`;
  },
  getPersonalStakeValue() {
    const template = Template.instance();
    return template.personalStakeValue.get().toFixed(1);
  },
  getSharePrice() {
    const template = Template.instance();
    const finneySharePrice = (template.sharePrice.get() * 1000).toFixed(1);
    return finneySharePrice;
  },
  isVisitor: () => Template.instance().data.visit,
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
