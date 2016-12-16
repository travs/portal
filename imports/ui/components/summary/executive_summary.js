import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Collections
import { Portfolios } from '/imports/api/portfolios.js';
// Corresponding html file
import './executive_summary.html';


Template.executive_summary.onCreated(() => {
  Meteor.subscribe('portfolios');
});


Template.executive_summary.helpers({
  portfolioCount() {
    return Portfolios.find({ managerAddress: Session.get('clientDefaultAccount') }).count();
  },
  selectedPortfolioName() {
    const doc = Portfolios.findOne({ managerAddress: Session.get('clientDefaultAccount') });
    return doc.name;
  },
  selectedPortfolioDelta() {
    const doc = Portfolios.findOne({ managerAddress: Session.get('clientDefaultAccount') });
    return doc.delta;
  },
});


Template.executive_summary.onRendered(() => {
});
