import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { CoreContracts } from '/imports/api/coreContracts';
// Smart contracts
import Core from '/imports/lib/assets/contracts/Core.sol.js';
// Corresponding html file
import './portfolio_list.html';


Template.portfolio_list.onCreated(() => {
  Meteor.subscribe('coreContracts');
  //TODO send command to server to update current coreContract
});


Template.portfolio_list.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = CoreContracts.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
});


Template.portfolio_list.onRendered(() => {});


Template.portfolio_list.events({
  'click .delete'() {
    const address = FlowRouter.getParam('address');
    const doc = CoreContracts.findOne({ address });
    if ((doc === undefined || address === undefined)) {
      return false;
    } else {
      Meteor.call('coreContracts.remove', doc._id);
      Materialize.toast('Portfolio deleted!', 4000, 'blue');
    }
  },
});
