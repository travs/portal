import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

// Collections
import Cores from '/imports/api/cores';
import Assets from '/imports/api/assets';

// Corresponding html file
import './portfolioContents.html';

Template.portfolioContents.onCreated(() => {
  Meteor.subscribe('cores');
  Meteor.subscribe('assets');
  Template.instance().totalPortfolioValue = new ReactiveVar();
});

Template.portfolioContents.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
  isPortfolioOwner() {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    if (doc === undefined || address === undefined) return false;
    return doc.owner === Session.get('selectedAccount');
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
    return (value / divisor).toFixed(4);
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
  portfolioPercentage() {
    const holdings = parseInt(this.holdings, 10);
    const price = parseInt(this.priceFeed.price, 10);
    const precision = parseInt(this.precision, 10);
    const divisor = Math.pow(10, precision);
    const value = holdings * (price / divisor);
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    if (doc === undefined) {
      return 'N/A';
    }
    const nav = doc.nav;

    return ((value * 100) / nav).toFixed(2);
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

Template.portfolioContents.onRendered(() => {});

Template.portfolioContents.events({});
