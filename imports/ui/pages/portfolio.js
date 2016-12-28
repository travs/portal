import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { CoreContracts } from '/imports/api/coreContracts';
// Components
import '/imports/ui/components/portfolio/portfolio_list.js';
import '/imports/ui/components/portfolio/portfolio_assets.js';
import '/imports/ui/components/portfolio/portfolio_manage.js';
// Corresponding html file
import './portfolio.html';


Template.portfolio.onCreated(() => {
  Meteor.subscribe('coreContracts');
});


Template.portfolio.helpers({
  getPortfolioName() {
    const address = FlowRouter.getParam('address');
    return (address === undefined) ? '' : CoreContracts.findOne({ address }).name;
  },
});


Template.portfolio.onRendered(() => {});
