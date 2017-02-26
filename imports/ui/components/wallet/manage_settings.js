import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import select2 from 'select2';
import d3 from 'd3';
import MG from 'metrics-graphics';

import './manage_settings.html';


Template.manage_settings.onCreated(() => {});


Template.manage_settings.helpers({
});

Template.manage_settings.onRendered(() => {
  $('select').select2();

  // Use Meteor.defer() to create chart after DOM is ready:
  Meteor.defer(() => {
    d3.json('../data/fake_users1.json', (data) => {
      data = MG.convert.date(data, 'date');
      MG.data_graphic({
        title: '',
        description: 'Wallet Chart',
        data: data,
        full_width: true,
        height: 250,
        right: 40,
        color: '#1189c6',
        target: '#charts',
        x_accessor: 'date',
        y_accessor: 'value'
      });
    });
  });
});


Template.manage_settings.events({
  'click .manage': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();
  },
});
