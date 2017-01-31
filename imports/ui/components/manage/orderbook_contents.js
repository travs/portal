import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Offers } from '/imports/api/offers.js';
// Corresponding html file
import './orderbook_contents.html';

Template.orderbook_contents.onCreated(() => {
  Meteor.subscribe('offers');
});

Template.orderbook_contents.helpers({
  offers() {
    // TODO clean up
    const docs = Offers.findOne({}, { sort: { id: -1 } })
    console.log(docs);
    return Offers.find({}, { sort: { id: -1 } });
  }
});

Template.orderbook_contents.onRendered(() => {
  // TODO clean up
  // Upsert Offers Collection
  const address = FlowRouter.getParam('address');
  Meteor.call('offers.sync', address);
});

Template.orderbook_contents.events({});
