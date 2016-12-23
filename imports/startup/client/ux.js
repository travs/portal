import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';


Meteor.startup(() => {
  Session.set('NetworkStatus', {
    isInactive: true,
    isMining: false,
    isError: false,
    isMined: false,
  });
});
