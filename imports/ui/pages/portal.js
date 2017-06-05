import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
<<<<<<< HEAD
// Collections
import Cores from '/imports/api/cores';
// Components
=======
>>>>>>> 964f2c69dfbe19a999d037a9b5f6ead00ba2dc78
import '/imports/ui/components/portal/portalList';
import '/imports/ui/components/portal/portalNew';
import './portal.html';

Template.portal.onCreated(() => {
  Meteor.subscribe('cores');
});


Template.portal.helpers({});


Template.portal.onRendered(() => {
  Meteor.call('cores.sync');
});


Template.portal.events({});
