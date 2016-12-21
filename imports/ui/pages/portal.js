import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Components
import '/imports/ui/components/welcome/welcome_list.js';
import '/imports/ui/components/summary/network_summary.js';
import '/imports/ui/components/summary/executive_summary.js';
import '/imports/ui/components/portfolio/portfolio_new.js';
import '/imports/ui/components/portfolio/portfolio_list.js';
import '/imports/ui/components/portfolio/portfolio_manage.js';
// Corresponding html file
import './portal.html';


Template.portal.onCreated(() => {
});


Template.portal.helpers({
});


Template.portal.onRendered(() => {
});


Template.portal.events({
});
