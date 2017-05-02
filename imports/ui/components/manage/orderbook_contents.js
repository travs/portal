import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Orders } from '/imports/api/orders.js';
// Corresponding html file
import './orderbook_contents.html';

Template.orderbook_contents.onCreated(() => {
  Meteor.subscribe('orders');
});

Template.orderbook_contents.helpers({
  orders() {
    // TODO clean up
    const docs = Orders.findOne({}, { sort: { id: -1 } })
    console.log(docs);
    return Orders.find({}, { sort: { id: -1 } });
  },
  openOrders() {
    const address = FlowRouter.getParam('address');
    return Orders.find({ owner: address }, { sort: { id: -1 } });
  },
});

Template.orderbook_contents.onRendered(() => {
  Meteor.call('orders.sync');
});

Template.orderbook_contents.events({});
