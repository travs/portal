import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Collections
import Vaults from '/imports/api/vaults';

import './portalList.html';

Template.portalList.onCreated(() => {
  Meteor.subscribe('vaults');
});

Template.portalList.helpers({
  searchedVaults: () =>
    Vaults.find(
      { name: { $regex: `.*${Session.get('searchVaults')}.*`, $options: 'i' } },
      { sort: { sharePrice: -1, createdAt: -1 } },
    ),
  getVaultLink: address =>
    Template.instance().data.main() === 'visit'
      ? `/visit/${address}`
      : `/fund/${address}`,
});

Template.portalList.onRendered(() => {});

Template.portalList.events({});
