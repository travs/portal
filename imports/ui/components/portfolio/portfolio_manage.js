import './portfolio_manage.html';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { BigNumber } from 'meteor/ethereum:web3';
import WalletInstance from '/imports/lib/ethereum/wallet.js';

import { Portfolios } from '/imports/api/portfolios.js';

import Core from '/imports/lib/assets/Core.sol.js';


Template.portfolio_manage.onCreated(() => {
  Meteor.subscribe('portfolios');
  Template.instance().state = new ReactiveDict();
  Template.instance().state.set({ isInactive: true });
  Template.instance().state.set({ investingSelected: true });

  Core.setProvider(WalletInstance.setWeb3Provider(WalletInstance.keystore));
});


Template.portfolio_manage.helpers({
  portfolios() {
    return Portfolios.find({}, { sort: { createdAt: -1 } });
  },
  portfolioCount() {
    return Portfolios.find({}).count();
  },
  isOwner() {
    return this.owner === Meteor.userId();
  },
  selectedPortfolioName() {
    const doc = Portfolios.findOne({ owner: Meteor.userId() });
    return doc.portfolioName;
  },
  isInvestingSelected() {
    if (Template.instance().state.get('investingSelected')) {
      return 'invest';
    }
    return 'redeem';
  },
});

Template.portfolio_manage.onRendered(() => {
  this.$('select').material_select();
});


Template.portfolio_manage.events({
  'change #investOrRedeemSelect'(event) {
    const selectedOption = $(event.target).val();
    if (selectedOption === '0') {
      Template.instance().state.set({ investingSelected: true });
    } else if (selectedOption === '1') {
      Template.instance().state.set({ investingSelected: false });
    } else {
      console.log('Error invstingSelected value');
    }
  },
  'change #input_amount'(event, instance) {
    const selectedAmount = $(event.target).val();
    if (selectedAmount !== undefined) {
      //TODO take real share price as input
      document.getElementById('input_sharePrice').value = '1.0';
    }
  },
  'submit .investOrRedeem'(event, instance) {
    // Prevent default browser form submit
    event.preventDefault();

    // Wallet needs to be unlocked
    if (WalletInstance.currentAddress() === false) {
      Materialize.toast('Unlock a Wallet first', 4000, 'orange');
      FlowRouter.go('/wallet');
      return;
    }

    // Init Reactive Dict
    const reactiveState = Template.instance().state;

    // Get value from form element
    const target = event.target;
    console.log(target.investOrRedeemSelect.value);

    const amount = target.amount.value;
    const sharePrice = target.sharePrice.value;
    if (!amount || !sharePrice) {
      Materialize.toast('Please fill out the form', 4000, 'blue');
    }

    reactiveState.set({ isInactive: false, isMining: true });

    // Init
    const doc = Portfolios.findOne({ owner: Meteor.userId() });
    const coreInstance = Core.at(doc.coreAddress);
    const fromAddr = WalletInstance.currentAddress();
    const gasPrice = 100000000000;
    const gas = 2500000;
    const weiAmount = web3.toWei(amount, 'ether');
    // From sharePrice to amount of shares
    const weiShareAmount = web3.toWei(amount * sharePrice, 'ether');

    // Invest or Redeem
    const selectedOption = target.investOrRedeemSelect.value;
    if (selectedOption === '0') {
      coreInstance.createShares(weiShareAmount, {from: fromAddr, value: weiAmount, gasPrice, gas }).then(function(tx_id) {
        // If this callback is called, the transaction was successfully processed.
        // Note that Ether Pudding takes care of watching the network and triggering
        // this callback.
        Materialize.toast('Transaction sent ' + tx_id, 4000, 'green');
      }).catch(function(e) {
        // There was an error! Handle it.
      });
    } else if (selectedOption === '1') {
      coreInstance.annihilateShares(weiShareAmount, weiAmount, {from: fromAddr, gasPrice, gas }).then(function(tx_id) {
        // If this callback is called, the transaction was successfully processed.
        // Note that Ether Pudding takes care of watching the network and triggering
        // this callback.
        Materialize.toast('Transaction sent ' + tx_id, 4000, 'green');
      }).catch(function(e) {
        // There was an error! Handle it.
      });
    } else {
      console.log('Error invstingSelected value');
    }
  },
});
