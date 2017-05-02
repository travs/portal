import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
// Collections
import { Cores } from '/imports/api/cores';
import { Universes } from '/imports/api/modules';
// Smart Contracts
import contract from 'truffle-contract';
import VersionJson from '/imports/lib/assets/contracts/Version.json';
import CoreJson from '/imports/lib/assets/contracts/Core.json';

import './portal_new.html';

const Version = contract(VersionJson);
const Core = contract(CoreJson);
// Creation of contract object
Version.setProvider(web3.currentProvider);
Core.setProvider(web3.currentProvider);

Template.portal_new.onCreated(() => {
  Meteor.subscribe('cores');
  Meteor.subscribe('universes');
});


Template.portal_new.helpers({});


Template.portal_new.onRendered(() => {});


Template.portal_new.events({
  'change form#new_portfolio #universe_select': (event) => {
    // Get value from form element
    const target = event.target;
    if (target.value === 'melon') {
      // Materialize.toast('Good choice. Now verifiy the accuracy of this registar', 4000, 'blue');
      Session.set('selectedRegistarIsMelon', true);
    }
  },
  'submit form#new_portfolio': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();

    // Collection parameters
    let portfolioAddress;
    const portfolioName = templateInstance.find('input#portfolio_name').value;
    const managerAddress = Session.get('clientManagerAccount');
    let universeAddress = Session.get('universeContractAddress');

    //TODO clean up database entries
    const sharePrice = web3.toWei(1.0, 'ether');
    const notional = 0;
    const intraday = 1.0;

    // Is mining
    Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });

    // Init contract instance
    const versionContract = Version.at(Session.get('versionContractAddress'));
    versionContract.createCore(
      portfolioName,
      Session.get('universeContractAddress'),
      Session.get('subscribeContractAddress'),
      Session.get('redeemContractAddress'),
      Session.get('riskMgmtContractAddress'),
      Session.get('managmentFeeContractAddress'),
      Session.get('performanceFeeContractAddress'),
      { from: managerAddress }
    )
    .then((result) => {
      return versionContract.numCreatedCores();
    })
    .then((result) => {
      return versionContract.coreAt(result.toNumber() - 1);
    })
    .then((result) => {
      portfolioAddress = result;
      const coreContract = Core.at(portfolioAddress);
      return coreContract.owner();
    })
    .then((result) => {
      if (result !== managerAddress) {
        Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: true, isMined: false });
        console.log('Portfolio Owner != Manager Address');
      } else {
        Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
        // Insert into Portfolio collection
        Meteor.call('cores.upsert',
          portfolioAddress,
          portfolioName,
          managerAddress,
          universeAddress,
          sharePrice,
          notional,
          intraday
        );
        Meteor.call('universes.insert',
          universeAddress,
          portfolioAddress,
          managerAddress
        );
      }
    });
  },
});
