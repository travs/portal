import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Vaults from '/imports/api/vaults';
import '/imports/ui/components/portfolio/portfolioOverview';
import '/imports/ui/components/portfolio/portfolioContents';
import '/imports/ui/components/portfolio/manageParticipation';
import './fund.html';


Template.fund.onCreated(() => {
  Meteor.subscribe('vaults');
  Meteor.subscribe('assets', FlowRouter.getParam('address'));
});


Template.fund.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Vaults.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
});


Template.fund.onRendered(() => {
  const address = FlowRouter.getParam('address'); // Address of Vault
  Meteor.call('assets.sync', address);
  const doc = Vaults.findOne({ address: FlowRouter.getParam('address') }); // loading delay
  if (doc) Meteor.call('vaults.syncVaultById', doc.id);
});
