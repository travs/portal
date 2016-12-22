import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';


import './header.html';

Template.layout_header.onRendered(() => {
  this.$('.button-collapse').sideNav({});
});

Template.layout_header.events({
  'click .portfolio'() {
    if (Session.get('isNewPortfolio') === true) {
      Session.set('isNewPortfolio', false);
      Materialize.toast('Here is your very own portfolio. Well done! Now show us your managing skills!', 8000, 'green');
    }
  },
});
