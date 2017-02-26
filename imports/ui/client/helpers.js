import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
// Collections
import { Cores } from '/imports/api/cores';
import { Registrars } from '/imports/api/modules';

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
Template.registerHelper('clientManagerAccount', () => Session.get('clientManagerAccount'));
Template.registerHelper('clientManagerAccountBalance', () => Session.get('clientManagerAccountBalance'));
Template.registerHelper('clientAccountList', () => Session.get('clientAccountList'));
Template.registerHelper('getAccountCount', () => Session.get('getAccountCount'));
// Cores
Template.registerHelper('getCores', () => Cores.find({}, { sort: { notional: -1, sharePrice: -1 } }));
Template.registerHelper('getCoreCount', () => Cores.find().count());
Template.registerHelper('hasManagerCreatedCore', () => Cores.find({ managerAddress: Session.get('clientManagerAccount') }).count() !== 0);
Template.registerHelper('getManagerAddressOfCore', () => (Cores.find({ managerAddress: Session.get('clientManagerAccount') }).count() !== 0 ? Cores.findOne({ managerAddress: Session.get('clientManagerAccount') }).address : false));
Template.registerHelper('getManagerNameOfCore', () => (Cores.find({ managerAddress: Session.get('clientManagerAccount') }).count() !== 0 ? Cores.findOne({ managerAddress: Session.get('clientManagerAccount') }).name : false));
Template.registerHelper('getManagerDeltaOfCore', () => (Cores.find({ managerAddress: Session.get('clientManagerAccount') }).count() !== 0 ? Cores.findOne({ managerAddress: Session.get('clientManagerAccount') }).delta : false));
Template.registerHelper('getIsNewOfCore', () => (Cores.find({ managerAddress: Session.get('clientManagerAccount') }).count() !== 0 ? Cores.findOne({ managerAddress: Session.get('clientManagerAccount') }).isNew : false));
Template.registerHelper('isCoreManagerThisManager', coreManagerAccount => coreManagerAccount === Session.get('clientManagerAccount'));
// Modules
Template.registerHelper('getRegistrars', () => Registrars.find({}, { sort: { index: 1 } }));
Template.registerHelper('getRegistrarOfThisPortfolioManager', () => {
  //TODO case for when portfolio manager has more than one core
  const registrarAddress = Cores.findOne({
    managerAddress: Session.get('clientManagerAccount')
  }).registrarAddress

  return Registrars.find({ address: registrarAddress }, { sort: { createdAt: -1 } });
});
// Contracts
Template.registerHelper('etherTokenContractAddress', () => Session.get('etherTokenContractAddress'));
Template.registerHelper('bitcoinTokenContractAddress', () => Session.get('bitcoinTokenContractAddress'));
Template.registerHelper('repTokenContractAddress', () => Session.get('repTokenContractAddress'));
Template.registerHelper('euroTokenContractAddress', () => Session.get('euroTokenContractAddress'));
Template.registerHelper('priceFeedContractAddress', () => Session.get('priceFeedContractAddress'));
Template.registerHelper('exchangeContractAddress', () => Session.get('exchangeContractAddress'));
Template.registerHelper('registrarContractAddrefunctionss', () => Session.get('registrarContractAddress'));
Template.registerHelper('versionContractAddress', () => Session.get('versionContractAddress'));
Template.registerHelper('metaContractAddress', () => Session.get('metaContractAddress'));
// UX
Template.registerHelper('isInactiveNetworkStatus', () => Session.get('NetworkStatus').isInactive);
Template.registerHelper('isMiningNetworkStatus', () => Session.get('NetworkStatus').isMining);
Template.registerHelper('isErrorNetworkStatus', () => Session.get('NetworkStatus').isError);
Template.registerHelper('isMinedNetworkStatus', () => Session.get('NetworkStatus').isMined);
