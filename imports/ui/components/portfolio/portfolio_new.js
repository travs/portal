import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { BigNumber } from 'web3';

import WalletInstance from '/imports/lib/ethereum/wallet.js';

import { Portfolios } from '/imports/api/portfolios.js';

// Load Truffle artifact
import Core from '/imports/lib/assets/Core.sol.js';

import './portfolio_new.html';


Template.portfolio_new.onCreated(() => {
  Meteor.subscribe('portfolios');
  Template.instance().state = new ReactiveDict();
  Template.instance().state.set({ isInactive: true });
});


Template.portfolio_new.helpers({
  portfolios() {
    return Portfolios.find({}, { sort: { createdAt: -1 } });
  },
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
    return source;
  },
});

Template.portfolio_new.onRendered(() => {
  this.$('select').material_select();
});


Template.portfolio_new.events({
  'submit .new-portfolio'(event, instance) {
    // Prevent default browser form submit
    event.preventDefault();

    // Wallet needs to be unlocked
    if (WalletInstance.currentAddress() === false) {
      Materialize.toast('Unlock a Wallet first', 4000, 'orange');
      FlowRouter.go('/wallet');
    }

    // Init Reactive Dict
    const reactiveState = Template.instance().state;

    // Get value from form element
    const target = event.target;
    const fund_name = target.fund_name.value;
    if (!fund_name) {
      console.log('empty string');
      //do something
    }

    // Clear form
    target.fund_name.value = '';

    reactiveState.set({ isInactive: false, isMining: true });

    // Init
    Core.setProvider(WalletInstance.setWeb3Provider(WalletInstance.keystore));
    const fromAddr = WalletInstance.currentAddress();
    const gasPrice = 100000000000;
    const gas = 2500000;


    Core.new(
      '0x0B2D33E8a261D2481E3860C8ea9B073a740D32c8',
      '0x0',
      '0x0',
      0,
      { from: fromAddr, gasPrice, gas }
    ).then((result, err) => {
      if (err) {
        reactiveState.set({ isMining: false, isError: true, error: String(err) });
      }
      if (result.address) {
        reactiveState.set({ isMining: false, isMined: true, address: result.address });
        // Insert a fund into the Collection
        const sharePrice = 1.0;
        const notional = 0;
        const intraday = 1.0;
        const mtd = 1.0;
        const ytd = 1.0;
        Meteor.call(
          'portfolios.insert', result.address, fromAddr,
          fund_name, sharePrice, notional, intraday, mtd, ytd
        );
      }
    });
  },
});
