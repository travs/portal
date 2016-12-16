import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

Template.registerHelper('isClientConnected', () => Session.get('isClientConnected'));
Template.registerHelper('isServerConnected', () => Session.get('isServerConnected'));
Template.registerHelper('clientDefaultAccount', () => Session.get('clientDefaultAccount'));
Template.registerHelper('clientDefaultAccountBalance', () => Session.get('clientDefaultAccountBalance'));
Template.registerHelper('clientAccountList', () => Session.get('clientAccountList'));
Template.registerHelper('accountCount', () => Session.get('accountCount'));
Template.registerHelper('clientDefaultAccount', () => Session.get('clientDefaultAccount'));
Template.registerHelper('latestBlock', () => Session.get('latestBlock'));
