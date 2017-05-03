import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
// Collections
import { Cores } from '/imports/api/cores';
import { Universes } from '/imports/api/modules';

// Server network
Template.registerHelper('isServerConnected', () => Session.get('isServerConnected'));
// Client network
Template.registerHelper('isClientConnected', () => Session.get('isClientConnected'));
Template.registerHelper('isMainNetwork', () => Session.get('network') === 'Main');
Template.registerHelper('isRopstenNetwork', () => Session.get('network') === 'Ropsten');
Template.registerHelper('isKovanNetwork', () => Session.get('network') === 'Kovan');
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
Template.registerHelper('getIsNewOfCore', () => (Cores.find({ managerAddress: Session.get('clientManagerAccount') }).count() !== 0 ? !Cores.findOne({ managerAddress: Session.get('clientManagerAccount') }).isUsed : false));
Template.registerHelper('isCoreManagerThisManager', coreManagerAccount => coreManagerAccount === Session.get('clientManagerAccount'));
// Modules
Template.registerHelper('getUniverses', () => Universes.find({}, { sort: { index: 1 } }));
Template.registerHelper('getUniverseOfThisPortfolioManager', () => {
  //TODO case for when portfolio manager has more than one core
  const universeAddress = Cores.findOne({
    managerAddress: Session.get('clientManagerAccount')
  }).universeAddress

  return Universes.find({ address: universeAddress }, { sort: { createdAt: -1 } });
});
// Contracts
Template.registerHelper('etherTokenContractAddress', () => Session.get('etherTokenContractAddress'));
Template.registerHelper('bitcoinTokenContractAddress', () => Session.get('bitcoinTokenContractAddress'));
Template.registerHelper('repTokenContractAddress', () => Session.get('repTokenContractAddress'));
Template.registerHelper('euroTokenContractAddress', () => Session.get('euroTokenContractAddress'));
Template.registerHelper('priceFeedContractAddress', () => Session.get('priceFeedContractAddress'));
Template.registerHelper('exchangeContractAddress', () => Session.get('exchangeContractAddress'));
Template.registerHelper('universeContractAddrefunctionss', () => Session.get('universeContractAddress'));
Template.registerHelper('versionContractAddress', () => Session.get('versionContractAddress'));
Template.registerHelper('governanceContractAddress', () => Session.get('governanceContractAddress'));
// UX
Template.registerHelper('isInactiveNetworkStatus', () => Session.get('NetworkStatus').isInactive);
Template.registerHelper('isMiningNetworkStatus', () => Session.get('NetworkStatus').isMining);
Template.registerHelper('isErrorNetworkStatus', () => Session.get('NetworkStatus').isError);
Template.registerHelper('isMinedNetworkStatus', () => Session.get('NetworkStatus').isMined);
//Reference currency
Template.registerHelper('refCurrency', () => Session.get('referenceCurrency'));
