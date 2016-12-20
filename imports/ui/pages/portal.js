import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
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
