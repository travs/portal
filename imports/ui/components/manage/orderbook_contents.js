import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Assets } from '/imports/api/assets.js';

import Specs from '/imports/lib/assets/utils/specs.js';


// Corresponding html file
import './orderbook_contents.html';

Template.orderbook_contents.onCreated(() => {
  Meteor.subscribe('assets');
});

Template.orderbook_contents.helpers({
});

Template.orderbook_contents.onRendered(() => {
  // Upsert Asset Collection
  const address = FlowRouter.getParam('address');
  Meteor.call('assets.sync', address);
});

Template.orderbook_contents.events({});
