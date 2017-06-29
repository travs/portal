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
  fundExisting() {
    const address = FlowRouter.getParam('address');
    const doc = Vaults.findOne({ address });
    return !(doc === undefined || address === undefined);
  },
  isVisitor: () => Template.instance().data.visit,
});

Template.fund.onRendered(() => {
  const address = FlowRouter.getParam('address');
  const doc = Vaults.findOne({ address });
  if (doc) {
    Meteor.call('vaults.syncVaultById', doc.id);
    Meteor.call('assets.sync', address);
  }
});
