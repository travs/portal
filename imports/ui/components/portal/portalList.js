import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Collections
import Cores from '/imports/api/cores';

import './portalList.html';


Template.portalList.onCreated(() => {
  Meteor.subscribe('cores');
});


Template.portalList.helpers({
  searchedCores: () => Cores.find({ name: { $regex: `.*${Session.get('searchCores')}.*`, $options: 'i' } }, { sort: { sharePrice: -1, createdAt: -1 } }),
});


Template.portalList.onRendered(() => {});


Template.portalList.events({});
