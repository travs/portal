import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

// Collections
import { Cores } from '/imports/api/cores';
import { Assets } from '/imports/api/assets.js';
import specs from '/imports/lib/assets/utils/specs.js';

// Corresponding html file
import './portfolio_contents.html';

Template.portfolio_contents.onCreated(() => {
  Meteor.subscribe('cores');
  Meteor.subscribe('assets');
  // Portfolio Value in Wei
  Template.instance().totalPortfolioValue = new ReactiveVar();
  const assetHolderAddress = FlowRouter.getParam('address');
  const docs = Assets.findOne({ holder: assetHolderAddress });
  let value = 0;
  for (doc in docs) {
    if (doc === undefined) continue;
    if (doc.holdings === undefined) continue;
    if (doc.priceFeed.price === undefined) continue;
    if (doc.precision === undefined) continue;
    const holdings = parseInt(doc.holdings, 10);
    const price = parseInt(doc.priceFeed.price, 10);
    const precision = parseInt(doc.precision, 10);
    const divisor = Math.pow(10, precision);
    value += holdings * (price / divisor);
  }
  Template.instance().totalPortfolioValue.set(value);
});

Template.portfolio_contents.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
  assets() {
    const assetHolderAddress = FlowRouter.getParam('address');
    return Assets.find({ holder: assetHolderAddress }, { sort: { name: 1 } });
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
    if (Template.instance().totalPortfolioValue.get() === 0) return 'N/A';
    return (value * 100) / Template.instance().totalPortfolioValue.get();
  },
  change24h() {
    switch (this.name) {
      case 'Ether Token': return Session.get('ethChange24h');
      case 'Melon Token': return Session.get('mlnChange24h');
      case 'Bitcoin Token': return Session.get('btcChange24h');
      case 'Euro Token': return Session.get('eurChange24h');
      case 'Rep Token': return Session.get('repChange24h');
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
