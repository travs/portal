import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import select2 from 'select2';
import { $ } from 'meteor/jquery';

import './manage_settings.html';


Template.manage_settings.onCreated(() => {});


Template.manage_settings.helpers({});


Template.manage_settings.onRendered(() => {
  $('select').select2();
});


Template.manage_settings.events({
  'shown.bs.modal #myModal': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();
  },
  'click .manage': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();
  },
});
