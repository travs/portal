import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import Cores from '/imports/api/cores';

import './header.html';

Template.layout_header.onCreated(() => {
  Meteor.subscribe('cores');
});

Template.layout_header.onRendered(() => {
});

Template.layout_header.helpers({
  isNew() {
    return Session.get('isNew');
  },
});

Template.layout_header.events({
  'click .portfolio'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Update Portfolio collection
    const numberOfCores = Cores.find({ owner: Session.get('selectedAccount') }).count();
    if (numberOfCores === 0) {
      FlowRouter.go('/');
    } else {
      const doc = Cores.findOne({ owner: Session.get('selectedAccount') });
      FlowRouter.go(`/fund/${doc.address}`);
    }
  },
  'click .manage'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Update Portfolio collection
    const numberOfCores = Cores.find({ owner: Session.get('selectedAccount') }).count();
    if (numberOfCores === 0) {
      FlowRouter.go('/');
    } else {
      const doc = Cores.findOne({ owner: Session.get('selectedAccount') });
      FlowRouter.go(`/manage/${doc.address}`);
    }
  },
  'click .newclick'() {
    if (Session.get('isNew'))
      {toastr.success("Well done! Now start by investing some K-ETH");}
    Session.set('isNew', false);
  },
});
