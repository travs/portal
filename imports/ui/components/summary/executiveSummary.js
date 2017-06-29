import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import BigNumber from 'bignumber.js';

import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/vault';

// Corresponding html file
import './executiveSummary.html';

Template.executiveSummary.onCreated(() => {
  const template = Template.instance();
  Meteor.subscribe('vaults');
  template.sharePrice = new ReactiveVar(0);
  store.subscribe(() => {
    const currentState = store.getState().vault;
    template.sharePrice.set(
      new BigNumber(currentState.sharePrice || 0).toString(),
    );
  });
  if (FlowRouter.getParam('address')) {
    store.dispatch(
      creators.requestCalculations(FlowRouter.getParam('address')),
    );
  }
});

Template.executiveSummary.helpers({
  getSharePrice() {
    const template = Template.instance();
    const finneySharePrice = (template.sharePrice.get() * 1000).toFixed(1);
    return finneySharePrice;
  },
});

Template.executiveSummary.onRendered(() => {});

Template.executiveSummary.events({});
