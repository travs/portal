import BigNumber from 'bignumber.js';

import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import Vaults from '/imports/api/vaults';

import convertFromTokenPrecision from '/imports/melon/interface/helpers/convertFromTokenPrecision';


// Server network
Template.registerHelper('isLoaded', () => Session.get('isLoaded'));
Template.registerHelper('isServerConnected', () => Session.get('isServerConnected'));
// Client network
Template.registerHelper('isClientConnected', () => Session.get('isClientConnected'));
Template.registerHelper('isMainNetwork', () => Session.get('network') === 'Main');
Template.registerHelper('isRopstenNetwork', () => Session.get('network') === 'Ropsten');
Template.registerHelper('isPrivateNetwork', () => Session.get('network') === 'Private');
Template.registerHelper('isKovanNetwork', () => Session.get('network') === 'Kovan');
Template.registerHelper('getNetwork', () => Session.get('network'));
Template.registerHelper('isSynced', () => Session.get('isSynced'));
Template.registerHelper('currentBlock', () => Session.get('currentBlock'));
// Account
Template.registerHelper('selectedAccount', () => Session.get('selectedAccount'));
Template.registerHelper('selectedAccountBalance', () => Session.get('selectedAccountBalance'));
// Vaults
Template.registerHelper('getVaults', () => Vaults.find({}, { sort: { notional: -1, sharePrice: -1 } }));
Template.registerHelper('getVaultCount', () => Vaults.find().count());
Template.registerHelper('hasManagerCreatedVault', () => Vaults.find({ owner: Session.get('selectedAccount') }).count() !== 0);
Template.registerHelper('getManagerAddressOfVault', () => (Vaults.find({ owner: Session.get('selectedAccount') }).count() !== 0 ? Vaults.findOne({ owner: Session.get('selectedAccount') }).address : false));
Template.registerHelper('getManagerNameOfVault', () => (Vaults.find({ owner: Session.get('selectedAccount') }).count() !== 0 ? Vaults.findOne({ owner: Session.get('selectedAccount') }).name : false));
Template.registerHelper('getManagerDeltaOfVault', () => (Vaults.find({ owner: Session.get('selectedAccount') }).count() !== 0 ? convertFromTokenPrecision(Vaults.findOne({ owner: Session.get('selectedAccount') }).delta, 18) : false));
Template.registerHelper('getSharePrice', () => (Vaults.find({ owner: Session.get('selectedAccount') }).count() !== 0 ? Vaults.findOne({ owner: Session.get('selectedAccount') }).sharePrice : false));
Template.registerHelper('getIsNewOfVault', () => (Vaults.find({ owner: Session.get('selectedAccount') }).count() !== 0 ? !Vaults.findOne({ owner: Session.get('selectedAccount') }).isUsed : false));
Template.registerHelper('getIsFundedVault', () => ((Vaults.find({ owner: Session.get('selectedAccount') }).fetch()[0] || { sharesSupply: 0 }).sharesSupply !== 0));
Template.registerHelper('getPortfolioDoc', () => {
  const address = FlowRouter.getParam('address');
  const doc = Vaults.findOne({ address });
  return (doc === undefined || address === undefined) ? '' : doc;
});
// UX
Template.registerHelper('isInactiveNetworkStatus', () => Session.get('NetworkStatus').isInactive);
Template.registerHelper('isMiningNetworkStatus', () => Session.get('NetworkStatus').isMining);
Template.registerHelper('isErrorNetworkStatus', () => Session.get('NetworkStatus').isError);
Template.registerHelper('isMinedNetworkStatus', () => Session.get('NetworkStatus').isMined);
// Reference currency
Template.registerHelper('refCurrency', () => Session.get('referenceCurrency'));
Template.registerHelper('showModal', () => Session.get('showModal'));
Template.registerHelper('displayBigNumber', (bigNumber, precision) =>
  new BigNumber(bigNumber).toFixed(parseInt(precision, 10)));
