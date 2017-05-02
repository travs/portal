import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
// Collections
import { Assets } from '/imports/api/assets.js';
import Specs from '/imports/lib/assets/utils/specs.js';
// Smart Contracts
import contract from 'truffle-contract';
import EtherTokenJson from '/imports/lib/assets/contracts/EtherToken.json';

// Corresponding html file
import './wallet_contents.html';

const EtherToken = contract(EtherTokenJson);
// Creation of contract object
EtherToken.setProvider(web3.currentProvider);

Template.wallet_contents.onCreated(() => {
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

Template.wallet_contents.helpers({
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
      case 'Rep Token': return Session.get('repChange24h');
      case 'Euro Token': return Session.get('eurChange24h');
      default: return '';
    }
  },
});

Template.wallet_contents.onRendered(() => {
  // Upsert Asset Collection
  const address = FlowRouter.getParam('address');
  Meteor.call('assets.sync', address);
});

Template.wallet_contents.events({
  'click .convert_to_eth': (event) => {
    // Prevent default browser form submit
    event.preventDefault();

    // Convert Eth Token
    const assetAddress = Specs.getTokenAddress('ETH-T');
    const assetHolderAddress = FlowRouter.getParam('address');
    const doc = Assets.findOne({ address: assetAddress, holder: assetHolderAddress }, { sort: { createdAt: -1 } });
    if (doc === undefined) return '';
    const holdings = parseInt(doc.holdings, 10);
    if (holdings === 0) {
      //TODO replace toast
      // Materialize.toast('All ETH Token already converted', 4000, 'blue');
    } else {
      console.log(`Holdings: ${holdings}`)
      EtherToken.at(assetAddress).withdraw(holdings, { from: assetHolderAddress }).then((result) => {
        Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
        // TODO insert txHash into appropriate collection
        console.log(`Tx Hash: ${result}`);
        Meteor.call('assets.sync', assetHolderAddress); // Upsert Assets Collection
        // Notification
        //TODO replace toast
        // Materialize.toast('All ETH Token converted', 4000, 'green');
      });
    }
  },
});
