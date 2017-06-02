import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Corresponding html file
import './uxPages.html';

Template.uxIndexPortal.onCreated(() => {
  Session.set('searchCores', '');
});

Template.uxIndexPortal.events({
  'input #searchCores': (event, template) => {
    Session.set('searchCores', event.currentTarget.value);
  },
});

Template.uxIndexGraph.onCreated(() => {});

Template.uxIndexGraph.helpers({});

Template.uxIndexGraph.onRendered(() => {});

Template.uxIndexGraph.events({});


Template.uxServerConnection.onCreated(() => {});

Template.uxServerConnection.helpers({});

Template.uxServerConnection.onRendered(() => {});

Template.uxServerConnection.events({});
