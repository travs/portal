import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Cores } from '/imports/api/cores';

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
    const numberOfCores = Cores.find({ owner: Session.get('clientManagerAccount') }).count();
    if (numberOfCores === 0) {
      FlowRouter.go('/');
    } else {
      const doc = Cores.findOne({ owner: Session.get('clientManagerAccount') });
      if (doc.isUsed === undefined) {
        Meteor.call('cores.setToUsed', doc._id);
        //TODO replace toast
        // Materialize.toast('Well done! Now show us your managing skills!', 8000, 'green');
        toastr.success("Well done! Now show us your managing skills!");
      }
      FlowRouter.go(`/portfolio/${doc.address}`);
    }
  },
  'click .manage'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Update Portfolio collection
    const numberOfCores = Cores.find({ owner: Session.get('clientManagerAccount') }).count();
    if (numberOfCores === 0) {
      FlowRouter.go('/');
    } else {
      const doc = Cores.findOne({ owner: Session.get('clientManagerAccount') });
      if (doc.isUsed === undefined) {
        Meteor.call('cores.setToUsed', doc._id);
        //TODO replace toast
        // Materialize.toast('Well done! Now show us your managing skills!', 8000, 'green');
        toastr.success("Well done! Now show us your managing skills!");
      }
      FlowRouter.go(`/manage/${doc.address}`);
    }
  },
  'click .newclick'() {
    Session.set('isNew', false);
  }
});
