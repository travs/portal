import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Cores } from '/imports/api/cores';
// Components
import '/imports/ui/components/portal/portal_list.js';
import '/imports/ui/components/portal/portal_new.js';
// Corresponding html file
import './portal.html';

Template.portal.onCreated(() => {
  Meteor.subscribe('cores');
});


Template.portal.helpers({});


Template.portal.onRendered(() => {
  Meteor.call('cores.sync'); // Upsert cores Collection
});


Template.portal.events({});
