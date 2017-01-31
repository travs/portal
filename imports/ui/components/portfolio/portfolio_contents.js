import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

// Collections
import { Assets } from '/imports/api/assets.js';

import Specs from '/imports/lib/assets/utils/specs.js';


// Corresponding html file
import './portfolio_contents.html';

Template.portfolio_contents.onCreated(() => {
  Meteor.subscribe('assets');
  // Portfolio Value in Wei
  Template.instance().totalPortfolioValue = new ReactiveVar();
});

Template.portfolio_contents.helpers({
  assets() {
    const docs = [];
    let value = 0;
    for (let i = 0; i < Specs.getTokens().length; i += 1) {
      const assetAddress = Specs.getTokenAddress(Specs.getTokens()[i]);
      const assetHolderAddress = FlowRouter.getParam('address');
      const doc = Assets.findOne({ address: assetAddress, holder: assetHolderAddress }, { sort: { createdAt: -1 } });
      if (doc === undefined) return '';
      const holdings = parseInt(doc.holdings, 10);
      const price = parseInt(doc.priceFeed.price, 10);
      const precision = parseInt(doc.precision, 10);
      const divisor = Math.pow(10, precision);
      value += holdings * (price / divisor);
      docs.push(doc);
    }
    Template.instance().totalPortfolioValue.set(value);
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
    const holdings = parseInt(this.holdings, 10);
    const price = parseInt(this.priceFeed.price, 10);
    const precision = parseInt(this.precision, 10);
    const divisor = Math.pow(10, precision);
    const value = holdings * (price / divisor);
    return (value * 100) / Template.instance().totalPortfolioValue.get();
  },
  change24h() {
    switch (this.name) {
      case 'Ether Token': return Session.get('ethChange24h');
      case 'Bitcoin Token': return Session.get('btcChange24h');
      case 'Rep Token': return Session.get('repChange24h');
      case 'Euro Token': return Session.get('eurChange24h');
      default: return '';
    }
  },
});

Template.portfolio_contents.onRendered(() => {
  // Upsert Asset Collection
  const address = FlowRouter.getParam('address');
  Meteor.call('assets.sync', address);
});

Template.portfolio_contents.events({});
