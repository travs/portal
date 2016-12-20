import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
// Collections
import { Portfolios } from '/imports/api/portfolios.js';


// Network connectivity
Template.registerHelper('isClientConnected', () => Session.get('isClientConnected'));
Template.registerHelper('isServerConnected', () => Session.get('isServerConnected'));
// Client network
Template.registerHelper('isMainNetwork', () => Session.get('network') === 'Main');
Template.registerHelper('isRopstenNetwork', () => Session.get('network') === 'Ropsten');
Template.registerHelper('getNetwork', () => Session.get('network'));
Template.registerHelper('isSynced', () => Session.get('syncing') === false);
Template.registerHelper('latestBlock', () => Session.get('latestBlock'));
// Account
Template.registerHelper('clientDefaultAccount', () => Session.get('clientDefaultAccount'));
Template.registerHelper('clientDefaultAccountBalance', () => Session.get('clientDefaultAccountBalance'));
Template.registerHelper('clientAccountList', () => Session.get('clientAccountList'));
Template.registerHelper('accountCount', () => Session.get('accountCount'));
Template.registerHelper('clientDefaultAccount', () => Session.get('clientDefaultAccount'));
// Portfolios
Template.registerHelper('getPortfolioCountOfDefaultAccount', () => Portfolios.find({ managerAddress: Session.get('clientDefaultAccount') }).count());
Template.registerHelper('getPortfolioCount', () => Portfolios.find().count());
Template.registerHelper('getPortfolios', () => Portfolios.find({}, { sort: { createdAt: -1 } }));
Template.registerHelper('isDefaultAccountThisPortfolioManager', managerAddress => managerAddress === Session.get('clientDefaultAccount'));
