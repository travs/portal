import './welcome_list.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

// import { Portfolios } from '/imports/api/portfolios.js';


Template.welcome_list.onCreated(function portfolioListOnCreated() {
  // Meteor.subscribe('portfolios');
});

Template.welcome_list.helpers({
  // portfolios() {
  //   return Portfolios.find({}, { sort: { intraday: -1 } });
  // },
  // portfolioCount() {
  //   return Portfolios.find({}).count();
  // },
});
