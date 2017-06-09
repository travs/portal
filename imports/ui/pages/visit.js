import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import '/imports/ui/components/portal/portalList';
import './visit.html';

Template.visit.onCreated(() => {
  Meteor.subscribe('cores');
});


Template.visit.helpers({});


Template.visit.onRendered(() => {
  Meteor.call('cores.sync');
});


Template.visit.events({});
