import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { bootstrapSwitch } from 'bootstrap-switch';
// Collections
import Vaults from '/imports/api/vaults';
// Specs
import specs from '/imports/melon/interface/helpers/specs';
// Corresponding html file
import './manageOverview.html';

const numberOfQuoteTokens = specs.getQuoteTokens().length;
const numberOfBaseTokens = specs.getBaseTokens().length;

const assetPairs =
  [...Array(numberOfQuoteTokens * numberOfBaseTokens).keys()]
  .map((value, index) => [
    specs.getBaseTokens()[index % numberOfBaseTokens],
    '/',
    specs.getQuoteTokens()[index % numberOfQuoteTokens],
  ].join(''))
  .sort();

FlowRouter.triggers.enter([(context) => {
  const doc = Vaults.findOne({ address: context.params.address });
  // TODO: Reactivate this, when we reactivate from portfolio trading
  // Session.set('fromPortfolio', doc !== undefined);
}], { only: ['manage'] });

Tracker.autorun(() => {
  const fromPortfolio = Session.get('fromPortfolio');

  if (FlowRouter.getRouteName() === 'manage') {
    const vault = Vaults.findOne({ owner: Session.get('selectedAccount') });

    if (fromPortfolio && vault) {
      FlowRouter.setParams({ address: vault.address });
    } else if (Session.get('selectedAccount')) {
      FlowRouter.setParams({ address: Session.get('selectedAccount') });
    }
  }
});

Template.manageOverview.onCreated(() => {
  Meteor.subscribe('vaults');
  // TODO send command to server to update current vaultContract
});

Template.manageOverview.helpers({
  assetPairs,
  currentAssetPair: Session.get('currentAssetPair'),
  selected: assetPair => (assetPair === Session.get('currentAssetPair') ? 'selected' : ''),
  isFromPortfolio: () => (Session.get('fromPortfolio') ? 'checked' : ''),
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Vaults.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
  getStatus() {
    if (Session.get('fromPortfolio')) return 'Manage fund';
    return 'Manage personal wallet';
  },
});

Template.manageOverview.events({
  'change .js-asset-pair-picker': (event) => {
    Session.set('currentAssetPair', event.currentTarget.value);
  },
});
