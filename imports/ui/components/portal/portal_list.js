import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Collections
import { Cores } from '/imports/api/cores';

import './portal_list.html';


Template.portal_list.onCreated(() => {
  Meteor.subscribe('cores');
});


Template.portal_list.helpers({
  searchedCores: () => Cores.find({ name: {'$regex' : '.*' + Session.get('searchCores') + '.*', '$options' : 'i'} }, { sort: { sharePrice: -1, createdAt: -1 } })
});


Template.portal_list.onRendered(() => {});


Template.portal_list.events({});
