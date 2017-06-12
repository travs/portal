import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import '/imports/ui/components/portal/portalList';
import './visit.html';


Template.visit.onCreated(() => {
  Meteor.subscribe('vaults');
});

Template.visit.helpers({});

Template.visit.onRendered(() => {
  Meteor.call('vaults.sync');
});

Template.visit.events({});
