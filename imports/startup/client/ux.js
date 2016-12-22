import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
// Collections
import { Portfolios } from '/imports/api/portfolios.js';



Meteor.startup(() => {
  Meteor.subscribe('portfolios');
  Session.set('hasManagerCreatedPortfolio', Portfolios.find({ managerAddress: Session.get('clientMangerAccount') }).count() !== 0);
});
