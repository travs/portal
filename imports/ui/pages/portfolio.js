import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
<<<<<<< HEAD
// Collections
import Cores from '/imports/api/cores';
// Components
=======
import { Cores } from '/imports/api/cores';
>>>>>>> 964f2c69dfbe19a999d037a9b5f6ead00ba2dc78
import '/imports/ui/components/portfolio/portfolioOverview';
import '/imports/ui/components/portfolio/portfolioContents';
import '/imports/ui/components/portfolio/manageParticipation';
import './portfolio.html';


Template.portfolio.onCreated(() => {
  Meteor.subscribe('cores');
  Meteor.subscribe('assets');
});


Template.portfolio.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Cores.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
});


Template.portfolio.onRendered(() => {
  const address = FlowRouter.getParam('address'); // Address of Core
  Meteor.call('assets.sync', address);
});
