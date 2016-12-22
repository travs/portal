import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Materialize } from 'meteor/poetic:materialize-scss';
// Collections
import { Portfolios } from '/imports/api/portfolios.js';

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
    if (Portfolios.find({ managerAddress: Session.get('clientDefaultAccount') }).count() !== 0) {
      const doc = Portfolios.findOne({ managerAddress: Session.get('clientDefaultAccount') });
      if (doc.isNew === true) {
        Meteor.call('portfolios.setToUsed', doc._id);
        Materialize.toast('Here is your very own portfolio. Well done! Now show us your managing skills!', 8000, 'green');
      }
    }
  },
});
