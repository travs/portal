import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

// Components
import '/imports/ui/components/welcome/welcome_list.js';

import './portal.html';


Template.portal.onCreated(() => {
});


Template.portal.helpers({
});


Template.portal.onRendered(() => {
  this.$('.modal-trigger').leanModal({
    dismissible: false,
    opacity: 0.5, // Opacity of modal background
    in_duration: 300, // Transition in duration
    out_duration: 200, // Transition out duration
  });
});


Template.portal.events({
});
