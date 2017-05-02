import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Collections
import { Cores } from '/imports/api/cores';

import './portal_list.html';


Template.portal_list.onCreated(() => {
  Meteor.subscribe('cores');
});


Template.portal_list.helpers({
	searchedCores: () => Cores.find({ name: {'$regex' : '.*' + Session.get('searchCores') + '.*'} })
});


Template.portal_list.onRendered(() => {});


Template.portal_list.events({});
