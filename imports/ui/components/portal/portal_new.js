import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
// Collections
import { Cores } from '/imports/api/cores';
import { Registrars } from '/imports/api/modules';
// Contracts
import Version from '/imports/lib/assets/contracts/Version.sol.js';
import Core from '/imports/lib/assets/contracts/Core.sol.js';

import './portal_new.html';


const ADDRESS_PLACEHOLDER = '0x0';

Template.portal_new.onCreated(() => {
  Meteor.subscribe('cores');
  Meteor.subscribe('registrars');
  // Creation of contract object
  Version.setProvider(web3.currentProvider);
  Core.setProvider(web3.currentProvider);
});


Template.portal_new.helpers({});


Template.portal_new.onRendered(() => {
  this.$('select').material_select();
});


Template.portal_new.events({
  'change form#new_portfolio #registrar_select'(event) {
    // Get value from form element
    const target = event.target;
    if (target.value === 'melon') {
      // Materialize.toast('Good choice. Now verifiy the accuracy of this registar', 4000, 'blue');
      Session.set('selectedRegistarIsMelon', true)
    }
  },
  'submit form#new_portfolio'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    // Get value from form element
    const target = event.target;

    // Collection parameters
    let portfolioAddress;
    const portfolioName = target.portfolio_name.value;
    const managerAddress = Session.get('clientMangerAccount');
    const managerEmail = target.manager_email.value;
    let registrarAddress;
    if (target.registrar_select.value === 'melon') {
      registrarAddress = Session.get('registrarContractAddress');
    } else {
      // Materialize.toast('This option is currently not supported', 4000, 'red');
      // return
      // TODO implement actual option
      registrarAddress = Session.get('registrarContractAddress');
    }

    //TODO clean up database entries
    const sharePrice = web3.toWei(1.0, 'ether');
    const notional = 0;
    const intraday = 1.0;

    // Is mining
    Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });

    // Init contract instance
    const versionContract = Version.at(Session.get('versionContractAddress'));
    versionContract.createCore(
      Session.get('registrarContractAddress'),
      ADDRESS_PLACEHOLDER,
      ADDRESS_PLACEHOLDER,
      ADDRESS_PLACEHOLDER,
      { from: managerAddress }
    )
    .then(() => versionContract.numCreatedCores())
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
        Meteor.call('cores.insert',
          portfolioAddress,
          portfolioName,
          managerAddress,
          managerEmail,
          registrarAddress,
          sharePrice,
          notional,
          intraday
        );
        Meteor.call('registrars.insert',
          registrarAddress,
          portfolioAddress,
          managerAddress
        );
      }
    });

  },
});
