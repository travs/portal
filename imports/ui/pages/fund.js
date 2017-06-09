import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Cores } from '/imports/api/cores';
import '/imports/ui/components/portfolio/portfolioOverview';
import '/imports/ui/components/portfolio/portfolioContents';
import '/imports/ui/components/portfolio/manageParticipation';
import './fund.html';


Template.fund.onCreated(() => {
  Meteor.subscribe('cores');
  Meteor.subscribe('assets');
});


Template.fund.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
});


Template.fund.onRendered(() => {
  const address = FlowRouter.getParam('address'); // Address of Core
  Meteor.call('assets.sync', address);
});
