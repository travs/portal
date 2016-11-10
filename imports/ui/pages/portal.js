import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import './portal.html';


Template.portal.onCreated(() => {
  Session.set('isConnected', true);
  web3.isConnected((err, result) => {
    if (!err) {
      Session.set('isConnected', result);
    } else {
      console.log(err);
    }
  });
});


Template.portal.helpers({
});


Template.portal.onRendered(() => {
});


Template.portal.events({
});
