import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Cores } from '/imports/api/cores';

import './header.html';

Template.layout_header.onCreated(() => {
  Meteor.subscribe('cores');
});

Template.layout_header.onRendered(() => {
});

Template.layout_header.events({
  'click .portfolio'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Update Portfolio collection
    const numberOfCores = Cores.find({ managerAddress: Session.get('clientMangerAccount') }).count();
    if (numberOfCores === 0) {
      FlowRouter.go('/');
    } else {
      const doc = Cores.findOne({ managerAddress: Session.get('clientMangerAccount') });
      if (doc.isNew === true) {
        Meteor.call('cores.setToUsed', doc._id);
        Materialize.toast('Well done! Now show us your managing skills!', 8000, 'green');
      }
      FlowRouter.go(`/portfolio/${doc.address}`);
    }
  },
  'click .manage'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Update Portfolio collection
    const numberOfCores = Cores.find({ managerAddress: Session.get('clientMangerAccount') }).count();
    if (numberOfCores === 0) {
      FlowRouter.go('/');
    } else {
      const doc = Cores.findOne({ managerAddress: Session.get('clientMangerAccount') });
      if (doc.isNew === true) {
        Meteor.call('cores.setToUsed', doc._id);
        Materialize.toast('Well done! Now show us your managing skills!', 8000, 'green');
      }
      FlowRouter.go(`/manage/${doc.address}`);
    }
  },
});
