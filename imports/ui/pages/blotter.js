import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Portfolios } from '/imports/api/portfolios.js';
// Components
import '/imports/ui/components/summary/network_summary.js';
import '/imports/ui/components/summary/executive_summary.js';
import '/imports/ui/components/blotter/blotter_chart.js';
import '/imports/ui/components/blotter/blotter_transaction_list.js';
// Corresponding html file
import './blotter.html';


Template.pagesBlotter.onCreated(() => {
  Meteor.subscribe('portfolios');
});


Template.pagesBlotter.helpers({
  getPortfolioName() {
    const portfolioId = FlowRouter.getParam('_id');
    const doc = Portfolios.findOne(portfolioId);
    return doc.portfolioName;
  },
  getPortfolioOwner() {
    const portfolioId = FlowRouter.getParam('_id');
    const doc = Portfolios.findOne(portfolioId);
    return doc.owner;
  },
});


Template.pagesBlotter.onRendered(() => {
});
