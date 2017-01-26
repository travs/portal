import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { CoreContracts } from '/imports/api/coreContracts';

import './header.html';

Template.layout_header.onCreated(() => {
  Meteor.subscribe('coreContracts');
});

Template.layout_header.onRendered(() => {
});

Template.layout_header.events({
  'click .portfolio'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Update Portfolio collection
    const coreContractsCount = CoreContracts.find({ managerAddress: Session.get('clientMangerAccount') }).count();
    if (coreContractsCount === 0) {
      FlowRouter.go('/');
    } else {
      const doc = CoreContracts.findOne({ managerAddress: Session.get('clientMangerAccount') });
      if (doc.isNew === true) {
        Meteor.call('coreContracts.setToUsed', doc._id);
        Materialize.toast('Well done! Now show us your managing skills!', 8000, 'green');
      }
      FlowRouter.go(`/portfolio/${doc.address}`);
    }
  },
  'click .manage'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Update Portfolio collection
    const coreContractsCount = CoreContracts.find({ managerAddress: Session.get('clientMangerAccount') }).count();
    if (coreContractsCount === 0) {
      FlowRouter.go('/');
    } else {
      const doc = CoreContracts.findOne({ managerAddress: Session.get('clientMangerAccount') });
      if (doc.isNew === true) {
        Meteor.call('coreContracts.setToUsed', doc._id);
        Materialize.toast('Well done! Now show us your managing skills!', 8000, 'green');
      }
      FlowRouter.go(`/manage/${doc.address}`);
    }
  },
});
