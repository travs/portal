import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';


Meteor.startup(() => {
  Session.set('isNewPortfolio', false);
});
