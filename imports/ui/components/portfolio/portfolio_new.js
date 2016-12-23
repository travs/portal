import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
// Collections
import { Portfolios } from '/imports/api/portfolios.js';
// Contracts
import Version from '/imports/lib/assets/contracts/Version.sol.js';
import Core from '/imports/lib/assets/contracts/Core.sol.js';

import './portfolio_new.html';


const ADDRESS_PLACEHOLDER = '0x0';

Template.portfolio_new.onCreated(() => {
  Meteor.subscribe('portfolios');
  // Creation of contract object
  Version.setProvider(web3.currentProvider);
  Core.setProvider(web3.currentProvider);
});


Template.portfolio_new.helpers({});


Template.portfolio_new.onRendered(() => {
  this.$('select').material_select();
});


Template.portfolio_new.events({
  'submit .new-portfolio'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;

    // Collection parameters
    let portfolioAddress;
    const portfolioName = target.portfolio_name.value;
    const managerAddress = Session.get('clientMangerAccount');
    const managerName = target.manager_name.value;
    const sharePrice = 1.0;
    const notional = 0;
    const intraday = 1.0;
    const mtd = 1.0;
    const ytd = 1.0;

    // Is mining
    Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });

    // Init contract instance
    const versionContract = Version.at(Session.get('versionContractAddress'));
    versionContract.createPortfolio(
      Session.get('registrarContractAddress'),
      ADDRESS_PLACEHOLDER,
      ADDRESS_PLACEHOLDER,
      ADDRESS_PLACEHOLDER,
      { from: managerAddress }
    )
    .then(() => versionContract.numPortfolios())
    .then((result) => {
      return versionContract.portfolios(result.toNumber() - 1);
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
        Meteor.call('portfolios.insert',
          portfolioAddress,
          portfolioName,
          managerAddress,
          managerName,
          sharePrice,
          notional,
          intraday,
          mtd,
          ytd
        );
      }
    });
  },
});
