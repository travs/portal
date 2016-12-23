import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Portfolios } from '/imports/api/portfolios';
// Components
import '/imports/ui/components/portfolio/portfolio_list.js';
import '/imports/ui/components/portfolio/portfolio_assets.js';
import '/imports/ui/components/portfolio/portfolio_manage.js';
// Corresponding html file
import './portfolio.html';


Template.portfolio.onCreated(() => {
  Meteor.subscribe('portfolios');
});


Template.portfolio.helpers({
  getPortfolioName() {
    const address = FlowRouter.getParam('address');
    return (address === undefined) ? '' : Portfolios.findOne({ address }).name;
  },
});


Template.portfolio.onRendered(() => {});
