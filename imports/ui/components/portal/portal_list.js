import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Collections
import { Cores } from '/imports/api/cores';
// Smart Contracts
import contract from 'truffle-contract';
import VersionJson from '/imports/lib/assets/contracts/Version.json';
import CoreJson from '/imports/lib/assets/contracts/Core.json';

import './portal_list.html';

const Version = contract(VersionJson);
const Core = contract(CoreJson);
// Creation of contract object
Version.setProvider(web3.currentProvider);
Core.setProvider(web3.currentProvider);


Template.portal_list.onCreated(() => {
  Meteor.subscribe('cores');
});


Template.portal_list.helpers({});


Template.portal_list.onRendered(() => {
  // Init contract instance
  //TODO move to server-side collection
  const versionContract = Version.at(Session.get('versionContractAddress'));
  let numberOfCoresCreated;
  versionContract.numCreatedCores()
  .then((result) => {
    console.log(result.toNumber());
    numberOfCoresCreated = result.toNumber();
    for (let index = 0; index < numberOfCoresCreated; index += 1) {
      versionContract.coreAt(index).then((result) => {
        console.log(result);
        portfolioAddress = result;
        const coreContract = Core.at(portfolioAddress);
        return coreContract.name();
      })
      .then((result) => {
        console.log(result);
      });
    }
  });
});


Template.portal_list.events({});
