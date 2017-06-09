import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import '/imports/ui/components/portal/portalList';
import '/imports/ui/components/portal/portalNew';
import './portal.html';


Template.portal.onCreated(() => {
  Meteor.subscribe('vaults');
});

Template.portal.helpers({});

Template.portal.onRendered(() => {
  Meteor.call('vaults.sync');
});

Template.portal.events({});
