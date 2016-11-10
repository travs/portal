import { Session } from 'meteor/session';

Template.registerHelper('isConnected', () => Session.get('isConnected'));
Template.registerHelper('latestBlock', () => Session.get('latestBlock'));
