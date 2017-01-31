import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Cores } from '/imports/api/cores';
// Components
import '/imports/ui/components/portfolio/portfolio_overview.js';
import '/imports/ui/components/portfolio/portfolio_contents.js';
import '/imports/ui/components/portfolio/manage_participation.js';
// Corresponding html file
import './portfolio.html';


Template.portfolio.onCreated(() => {
  Meteor.subscribe('cores');
});


Template.portfolio.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
});


Template.portfolio.onRendered(() => {});
