import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Assets } from '/imports/api/assets.js';

import Specs from '/imports/lib/assets/utils/specs.js';


// Corresponding html file
import './portfolio_contents.html';

Template.portfolio_contents.onCreated(() => {
  Meteor.subscribe('assets');
});

Template.portfolio_contents.helpers({
  assets() {
    const docs = [];
    for (let i = 0; i < Specs.getTokens().length; i += 1) {
      const assetAddress = Specs.getTokenAddress(Specs.getTokens()[i]);
      const assetHolderAddress = FlowRouter.getParam('address');
      docs.push(Assets.findOne({ address: assetAddress, holder: assetHolderAddress }, { sort: { createdAt: -1 } }));
    }
    return docs;
  },
  address() {
    return FlowRouter.getParam('address');
  },
  convertFromTokenPrecision(value) {
    if (Object.keys(this).length === 0) return '';
    const precision = this.precision;
    const divisor = Math.pow(10, precision);
    return value / divisor;
  },
  convertTo18Precision(value) {
    if (Object.keys(this).length === 0) return '';
    const precision = this.precision;
    const multiplier = Math.pow(10, 18 - precision);
    return parseFloat(value, 10) * multiplier;
  },
  invertValue(value) {
    // TODO fix function naming
    return web3.toWei(1.0 / parseFloat(value, 10), 'ether');
  },
  portfolioPercentrage() {

  }
});

Template.portfolio_contents.onRendered(() => {
  // Upsert Asset Collection
  const address = FlowRouter.getParam('address');
  Meteor.call('assets.sync', address);
});

Template.portfolio_contents.events({});
