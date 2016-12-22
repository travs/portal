import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
// Collections
import { Portfolios } from '/imports/api/portfolios.js';


// Server network
Template.registerHelper('isServerConnected', () => Session.get('isServerConnected'));
// Client network
Template.registerHelper('isClientConnected', () => Session.get('isClientConnected'));
Template.registerHelper('isMainNetwork', () => Session.get('network') === 'Main');
Template.registerHelper('isRopstenNetwork', () => Session.get('network') === 'Ropsten');
Template.registerHelper('getNetwork', () => Session.get('network'));
Template.registerHelper('isSynced', () => Session.get('syncing') === false);
Template.registerHelper('latestBlock', () => Session.get('latestBlock'));
// Account
Template.registerHelper('clientDefaultAccount', () => Session.get('clientDefaultAccount'));
Template.registerHelper('clientDefaultAccountBalance', () => Session.get('clientDefaultAccountBalance'));
Template.registerHelper('clientAccountList', () => Session.get('clientAccountList'));
Template.registerHelper('getAccountCount', () => Session.get('getAccountCount'));
Template.registerHelper('clientDefaultAccount', () => Session.get('clientDefaultAccount'));
// Portfolios
Template.registerHelper('getPortfolios', () => Portfolios.find({}, { sort: { createdAt: -1 } }));
Template.registerHelper('getPortfolioCount', () => Portfolios.find().count());
Template.registerHelper('getPortfolioCountOfDefaultAccount', () => Portfolios.find({ managerAddress: Session.get('clientDefaultAccount') }).count());
Template.registerHelper('getPortfolioNameOfDefaultAccount', () => Portfolios.findOne({ managerAddress: Session.get('clientDefaultAccount') }).name);
Template.registerHelper('getPortfolioDeltaOfDefaultAccount', () => Portfolios.findOne({ managerAddress: Session.get('clientDefaultAccount') }).delta);
Template.registerHelper('getPortfolioIsNewOfDefaultAccount', () => Portfolios.findOne({ managerAddress: Session.get('clientDefaultAccount') }).isNew);
Template.registerHelper('isDefaultAccountThisPortfolioManager', managerAddress => managerAddress === Session.get('clientDefaultAccount'));
// Contracts
Template.registerHelper('etherTokenContractAddress', () => Session.get('etherTokenContractAddress'));
Template.registerHelper('bitcoinTokenContractAddress', () => Session.get('bitcoinTokenContractAddress'));
Template.registerHelper('dollarTokenContractAddress', () => Session.get('dollarTokenContractAddress'));
Template.registerHelper('euroTokenContractAddress', () => Session.get('euroTokenContractAddress'));
Template.registerHelper('priceFeedContractAddress', () => Session.get('priceFeedContractAddress'));
Template.registerHelper('exchangeContractAddress', () => Session.get('exchangeContractAddress'));
Template.registerHelper('registrarContractAddress', () => Session.get('registrarContractAddress'));
Template.registerHelper('versionContractAddress', () => Session.get('versionContractAddress'));
Template.registerHelper('metaContractAddress', () => Session.get('metaContractAddress'));
// UX
