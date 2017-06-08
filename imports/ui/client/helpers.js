import BigNumber from 'bignumber.js';

import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import Cores from '/imports/api/cores';

import convertFromTokenPrecision from '/imports/melon/interface/helpers/convertFromTokenPrecision';


// Server network
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
// Cores
Template.registerHelper('getCores', () => Cores.find({}, { sort: { notional: -1, sharePrice: -1 } }));
Template.registerHelper('getCoreCount', () => Cores.find().count());
Template.registerHelper('hasManagerCreatedCore', () => Cores.find({ owner: Session.get('selectedAccount') }).count() !== 0);
Template.registerHelper('getManagerAddressOfCore', () => (Cores.find({ owner: Session.get('selectedAccount') }).count() !== 0 ? Cores.findOne({ owner: Session.get('selectedAccount') }).address : false));
Template.registerHelper('getManagerNameOfCore', () => (Cores.find({ owner: Session.get('selectedAccount') }).count() !== 0 ? Cores.findOne({ owner: Session.get('selectedAccount') }).name : false));
Template.registerHelper('getManagerDeltaOfCore', () => (Cores.find({ owner: Session.get('selectedAccount') }).count() !== 0 ? convertFromTokenPrecision(Cores.findOne({ owner: Session.get('selectedAccount') }).delta, 18) : false));
Template.registerHelper('getSharePrice', () => (Cores.find({ owner: Session.get('selectedAccount') }).count() !== 0 ? Cores.findOne({ owner: Session.get('selectedAccount') }).sharePrice : false));
Template.registerHelper('getIsNewOfCore', () => (Cores.find({ owner: Session.get('selectedAccount') }).count() !== 0 ? !Cores.findOne({ owner: Session.get('selectedAccount') }).isUsed : false));
Template.registerHelper('getIsFundedCore', () => ((Cores.find({ owner: Session.get('selectedAccount') }).fetch()[0] || { sharesSupply: 0 }).sharesSupply !== 0));
Template.registerHelper('getPortfolioDoc', () => {
  const address = FlowRouter.getParam('address');
  const doc = Cores.findOne({ address });
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
