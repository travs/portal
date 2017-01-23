import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
// Collections
import { CoreContracts } from '/imports/api/coreContracts';
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
Template.registerHelper('clientMangerAccount', () => Session.get('clientMangerAccount'));
Template.registerHelper('clientMangerAccountBalance', () => Session.get('clientMangerAccountBalance'));
Template.registerHelper('clientAccountList', () => Session.get('clientAccountList'));
Template.registerHelper('getAccountCount', () => Session.get('getAccountCount'));
Template.registerHelper('clientMangerAccount', () => Session.get('clientMangerAccount'));
// CoreContracts
Template.registerHelper('getCoreContracts', () => CoreContracts.find({}, { sort: { createdAt: -1 } }));
Template.registerHelper('getCoreCount', () => CoreContracts.find().count());
Template.registerHelper('hasManagerCreatedCore', () => CoreContracts.find({ managerAddress: Session.get('clientMangerAccount') }).count() !== 0);
Template.registerHelper('getManagerAddressOfCore', () => (CoreContracts.find({ managerAddress: Session.get('clientMangerAccount') }).count() !== 0 ? CoreContracts.findOne({ managerAddress: Session.get('clientMangerAccount') }).address : false));
Template.registerHelper('getManagerNameOfCore', () => (CoreContracts.find({ managerAddress: Session.get('clientMangerAccount') }).count() !== 0 ? CoreContracts.findOne({ managerAddress: Session.get('clientMangerAccount') }).name : false));
Template.registerHelper('getManagerDeltaOfCore', () => (CoreContracts.find({ managerAddress: Session.get('clientMangerAccount') }).count() !== 0 ? CoreContracts.findOne({ managerAddress: Session.get('clientMangerAccount') }).delta : false));
Template.registerHelper('getIsNewOfCore', () => (CoreContracts.find({ managerAddress: Session.get('clientMangerAccount') }).count() !== 0 ? CoreContracts.findOne({ managerAddress: Session.get('clientMangerAccount') }).isNew : false));
Template.registerHelper('isCoreManagerThisManager', coreManagerAccount => coreManagerAccount === Session.get('clientMangerAccount'));
// Modules
Template.registerHelper('getRegistrars', () => Registrars.find({}, { sort: { index: 1 } }));
Template.registerHelper('getRegistrarOfThisPortfolioManager', () => {
  //TODO case for when portfolio manager has more than one core
  const registrarAddress = CoreContracts.findOne({
    managerAddress: Session.get('clientMangerAccount')
  }).registrarAddress

  return Registrars.find({ address: registrarAddress }, { sort: { createdAt: -1 } });
});
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
Template.registerHelper('isInactiveNetworkStatus', () => Session.get('NetworkStatus').isInactive);
Template.registerHelper('isMiningNetworkStatus', () => Session.get('NetworkStatus').isMining);
Template.registerHelper('isErrorNetworkStatus', () => Session.get('NetworkStatus').isError);
Template.registerHelper('isMinedNetworkStatus', () => Session.get('NetworkStatus').isMined);
