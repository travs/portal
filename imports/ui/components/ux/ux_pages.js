import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Corresponding html file
import './ux_pages.html';

Template.ux_index_portal.onCreated(() => {
	Session.set("searchCores", "");
})

Template.ux_index_portal.events({
	'input #searchCores': (event, template) => {
		Session.set("searchCores", event.currentTarget.value);
	}
})

Template.ux_index_graph.onCreated(() => {});

Template.ux_index_graph.helpers({});

Template.ux_index_graph.onRendered(() => {});

Template.ux_index_graph.events({});


Template.ux_server_connection.onCreated(() => {});

Template.ux_server_connection.helpers({});

Template.ux_server_connection.onRendered(() => {});

Template.ux_server_connection.events({});


