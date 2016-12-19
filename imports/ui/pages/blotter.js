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
import '/imports/ui/components/portfolio/portfolio_manage.js';
// Corresponding html file
import './blotter.html';


Template.blotter.onCreated(() => {
  Meteor.subscribe('portfolios');
});


Template.blotter.helpers({
  getPortfolioName() {
    const address = FlowRouter.getParam('address');
    console.log(address)
    const doc = Portfolios.findOne('0x0');
    console.log(doc)
    return doc.name;
  },
  getPortfolioOwner() {
    const address = FlowRouter.getParam('address');
    const doc = Portfolios.findOne(address);
    return doc.owner;
  },
});


Template.blotter.onRendered(() => {
});
