import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './header.html';

Template.layout_header.onRendered(function headerOnRendered() {
  this.$('.button-collapse').sideNav({});
});
