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
    return Portfolios.find({ owner: Session.get('clientDefaultAccount') }).count();
  },
  selectedPortfolioName() {
    const doc = Portfolios.findOne({ owner: Session.get('clientDefaultAccount') });
    return doc.portfolioName;
  },
  selectedPortfolioDelta() {
    const doc = Portfolios.findOne({ owner: Session.get('clientDefaultAccount') });
    return doc.delta;
  },
});


Template.executive_summary.onRendered(() => {
});
