import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './portal_list.html';

import { Cores } from '/imports/api/cores';


Template.portal_list.onCreated(() => {});


Template.portal_list.helpers({
	searchedCores: () => Cores.find({ name: {'$regex' : '.*' + Session.get('searchCores') + '.*'} })
});


Template.portal_list.onRendered(() => {});


Template.portal_list.events({});

