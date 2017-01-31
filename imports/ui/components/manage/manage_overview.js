import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// Collections
import { Cores } from '/imports/api/cores';
// Smart contracts
import Core from '/imports/lib/assets/contracts/Core.sol.js';
// Corresponding html file
import './manage_overview.html';


Template.manage_overview.onCreated(() => {
  Meteor.subscribe('cores');
  //TODO send command to server to update current coreContract
});


Template.manage_overview.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
});


Template.manage_overview.onRendered(() => {});


Template.manage_overview.events({
  'click .delete'() {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    if ((doc === undefined || address === undefined)) {
      return false;
    } else {
      Meteor.call('cores.remove', doc._id);
      Materialize.toast('Portfolio deleted!', 4000, 'blue');
    }
  },
});
