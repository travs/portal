import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Corresponding html file
import './uxPages.html';

Template.uxIndexPortal.onCreated(() => {
  Session.set('searchVaults', '');
});

Template.uxIndexPortal.events({
  'input #searchVaults': (event, template) => {
    Session.set('searchVaults', event.currentTarget.value);
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
