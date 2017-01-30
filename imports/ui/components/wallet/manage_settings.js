import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';


import './manage_settings.html';


Template.manage_settings.onCreated(() => {
});


Template.manage_settings.helpers({
});

Template.manage_settings.onRendered(() => {
  this.$('select').material_select();
});


Template.manage_settings.events({
});
