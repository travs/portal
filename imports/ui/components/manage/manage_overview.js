import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { bootstrapSwitch } from 'bootstrap-switch';
// Collections
import { Cores } from '/imports/api/cores';
// Smart contracts
import Core from '/imports/lib/assets/contracts/Core.json';
// Corresponding html file
import './manage_overview.html';


Template.manage_overview.onCreated(() => {
  Meteor.subscribe('cores');
  // TODO send command to server to update current coreContract
});


Template.manage_overview.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
  'assetpairs': () => {
    return ['BTC/ETH', 'REP/ETH', 'EUR/ETH', 'MLN/ETH'];
  },
  'selectedAssetPair': () => {
    if(!Session.get('selectedAssetPair')) return 'BTC/ETH';
    return Session.get('selectedAssetPair');
  }
});


Template.manage_overview.onRendered(() => {
  $("[name='my-checkbox']").bootstrapSwitch();
});


Template.manage_overview.events({
  'change select.js-assetpair': (event, templateInstance) => {
    Session.set('selectedAssetPair', templateInstance.find('select.js-assetpair').value);
    console.log('Asset pair selected is:', Session.get('selectedAssetPair'));
  }
});
