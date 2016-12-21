import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { BigNumber } from 'web3';
// Collections
import { Portfolios } from '/imports/api/portfolios.js';

// Load Truffle artifact
import Version from '/imports/lib/assets/contracts/Version.sol.js';
import Core from '/imports/lib/assets/contracts/Core.sol.js';

import './portfolio_new.html';


const ADDRESS_PLACEHOLDER = '0x0';

Template.portfolio_new.onCreated(() => {
  Meteor.subscribe('portfolios');
  Template.instance().state = new ReactiveDict();
  Template.instance().state.set({ isInactive: true });
  // Creation of contract object
  Version.setProvider(web3.currentProvider);
  Core.setProvider(web3.currentProvider);
});


Template.portfolio_new.helpers({
  isError() {
    return Template.instance().state.get('isError');
  },
  isMining() {
    return Template.instance().state.get('isMining');
  },
  isMined() {
    return Template.instance().state.get('isMined');
  },
  address() {
    return Template.instance().state.get('address');
  },
  isCreated() {
    return Template.instance().state.get('isCreated');
  },
  isInactive() {
    return Template.instance().state.get('isInactive');
  },
  source() {
    return Version.abi;
  },
});

Template.portfolio_new.onRendered(() => {
  this.$('select').material_select();
});


Template.portfolio_new.events({
  'submit .new-portfolio'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Init Reactive Dict
    const reactiveState = Template.instance().state;
    reactiveState.set({ isInactive: false, isMining: true });

    // Get value from form element
    const target = event.target;

    // Collection parameters
    let portfolioAddress;
    const portfolioName = target.portfolio_name.value;
    const managerAddress = Session.get('clientDefaultAccount');
    const managerName = target.manager_name.value;
    const sharePrice = 1.0;
    const notional = 0;
    const intraday = 1.0;
    const mtd = 1.0;
    const ytd = 1.0;

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
        reactiveState.set({ isMining: false, isError: true, error: String('Portfolio Owner != Manager Address') });
      } else {
        reactiveState.set({ isMining: false, isMined: true, address: portfolioAddress });
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
