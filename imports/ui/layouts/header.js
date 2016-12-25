import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Portfolios } from '/imports/api/portfolios';

import './header.html';

Template.layout_header.onCreated(() => {
  Meteor.subscribe('portfolios');
});

Template.layout_header.onRendered(() => {
});

Template.layout_header.events({
  'click .portfolio'() {
    // Prevent default browser form submit
    event.preventDefault();

    // Update Portfolio collection
    const portfoliosCount = Portfolios.find({ managerAddress: Session.get('clientMangerAccount') }).count()
    if (portfoliosCount === 0) {
      FlowRouter.go('/');
    } else {
      const doc = Portfolios.findOne({ managerAddress: Session.get('clientMangerAccount') });
      if (doc.isNew === true) {
        Meteor.call('portfolios.setToUsed', doc._id);
        Materialize.toast('Well done! Now show us your managing skills!', 8000, 'green');
      }
      FlowRouter.go(`/portfolio/${doc.address}`);
    }
  },
});
