import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
// Collections
import { CoreContracts } from '/imports/api/coreContracts';
import { Registrars } from '/imports/api/modules';
// Contracts
import Version from '/imports/lib/assets/contracts/Version.sol.js';
import Core from '/imports/lib/assets/contracts/Core.sol.js';

import './portal_new.html';


const ADDRESS_PLACEHOLDER = '0x0';

Template.portal_new.onCreated(() => {
  Meteor.subscribe('coreContracts');
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
    const managerName = target.manager_name.value;
    let registrarAddress;
    if (target.registrar_select.value === 'melon') {
      registrarAddress = Session.get('registrarContractAddress');
    } else {
      Materialize.toast('This option is currently not supported', 4000, 'red');
      return
    }
    const sharePrice = 1.0;
    const notional = 0;
    const intraday = 1.0;
    const mtd = 1.0;
    const ytd = 1.0;

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
        Meteor.call('coreContracts.insert',
          portfolioAddress,
          portfolioName,
          managerAddress,
          managerName,
          registrarAddress,
          sharePrice,
          notional,
          intraday,
          mtd,
          ytd
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
