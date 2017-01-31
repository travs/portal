import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Assets } from '/imports/api/assets.js';

import Specs from '/imports/lib/assets/utils/specs.js';


// Corresponding html file
import './wallet_contents.html';

Template.wallet_contents.onCreated(() => {
  Meteor.subscribe('assets');
});

Template.wallet_contents.helpers({
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
  formatPrice() {
    if (Object.keys(this).length === 0) return '';
    const precision = this.precision;
    const divisor = Math.pow(10, precision);
    const price = this.priceFeed.price / divisor;
    return price;
  },
});

Template.wallet_contents.onRendered(() => {
  // Upsert Asset Collection
  const address = FlowRouter.getParam('address');
  Meteor.call('assets.sync', address);
});

Template.wallet_contents.events({});
