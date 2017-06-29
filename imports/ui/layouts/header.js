import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import Vaults from '/imports/api/vaults';

import './header.html';

Template.layoutHeader.onCreated(() => {
  Meteor.subscribe('vaults');
});

Template.layoutHeader.onRendered(() => {});

Template.layoutHeader.helpers({
  isNew() {
    return Session.get('isNew');
  },
});

Template.layoutHeader.events({
  'click .portfolio'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Update Portfolio collection
    const numberOfVaults = Vaults.find({
      owner: Session.get('selectedAccount'),
    }).count();
    if (numberOfVaults === 0) {
      FlowRouter.go('/');
    } else {
      const doc = Vaults.findOne({ owner: Session.get('selectedAccount') });
      FlowRouter.go(`/fund/${doc.address}`);
    }
  },
  'click .manage'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Update Portfolio collection
    const numberOfVaults = Vaults.find({
      owner: Session.get('selectedAccount'),
    }).count();
    if (numberOfVaults === 0) {
      FlowRouter.go('/');
    } else {
      const doc = Vaults.findOne({ owner: Session.get('selectedAccount') });
      FlowRouter.go(`/manage/${doc.address}`);
    }
  },
  'click .newclick'() {
    if (Session.get('isNew')) {
      toastr.success('Well done! Now start by investing some K-ETH');
    }
    Session.set('isNew', false);
  },
});
