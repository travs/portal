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
Template.registerHelper('clientMangerAccount', () => Session.get('clientMangerAccount'));
Template.registerHelper('clientMangerAccountBalance', () => Session.get('clientMangerAccountBalance'));
Template.registerHelper('clientAccountList', () => Session.get('clientAccountList'));
Template.registerHelper('getAccountCount', () => Session.get('getAccountCount'));
Template.registerHelper('clientMangerAccount', () => Session.get('clientMangerAccount'));
// Portfolios
Template.registerHelper('getPortfolios', () => Portfolios.find({}, { sort: { createdAt: -1 } }));
Template.registerHelper('getPortfolioCount', () => Portfolios.find().count());
Template.registerHelper('hasManagerCreatedPortfolio', () => Portfolios.find({ managerAddress: Session.get('clientMangerAccount') }).count() !== 0);
Template.registerHelper('getPortfolioOfManagerName', () => (Portfolios.find({ managerAddress: Session.get('clientMangerAccount') }).count() !== 0 ? Portfolios.findOne({ managerAddress: Session.get('clientMangerAccount') }).name : false));
Template.registerHelper('getPortfolioOfManagerDelta', () => (Portfolios.find({ managerAddress: Session.get('clientMangerAccount') }).count() !== 0 ? Portfolios.findOne({ managerAddress: Session.get('clientMangerAccount') }).delta : false));
Template.registerHelper('getPortfolioOfManagerIsNew', () => (Portfolios.find({ managerAddress: Session.get('clientMangerAccount') }).count() !== 0 ? Portfolios.findOne({ managerAddress: Session.get('clientMangerAccount') }).isNew : false));
Template.registerHelper('isManagerThisPortfolioManager', portfolioManagerAccount => portfolioManagerAccount === Session.get('clientMangerAccount'));
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
