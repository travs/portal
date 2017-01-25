import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { BigNumber } from 'meteor/ethereum:web3';
// Collections
import { CoreContracts } from '/imports/api/coreContracts';
// Contracts
import Core from '/imports/lib/assets/contracts/Core.sol.js';
import constants from '/imports/lib/assets/utils/constants.js';


import './portfolio_manage.html';


Template.portfolio_manage.onCreated(() => {
  Meteor.subscribe('coreContracts');
  Template.instance().state = new ReactiveDict();
  Template.instance().state.set({ investingSelected: true });
  // Creation of contract object
  Core.setProvider(web3.currentProvider);
});


Template.portfolio_manage.helpers({
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
  'submit .investOrRedeem'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Init Reactive Dict
    const reactiveState = Template.instance().state;

    // Get value from form element
    const target = event.target;
    const amount = target.amount.value;
    const sharePrice = target.sharePrice.value;
    if (!amount || !sharePrice) {
      Materialize.toast('Please fill out the form', 4000, 'blue');
    }

    // Is mining
    Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });

    // Init
    const doc = CoreContracts.findOne({ managerAddress: Session.get('clientMangerAccount') });
    const coreContract = Core.at(doc.address);
    const managerAddress = Session.get('clientMangerAccount');
    const weiAmount = web3.toWei(amount, 'ether');

    // From sharePrice to amount of shares
    const weiShareAmount = web3.toWei(amount * sharePrice, 'ether');

    // Invest or Redeem
    const selectedOption = target.investOrRedeemSelect.value;
    if (selectedOption === '0') {
      coreContract.createShares(weiShareAmount, { from: managerAddress, value: weiAmount })
      .then((result) => {
        Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
        // TODO insert tx w ${result} as txhash
        return coreContract.totalSupply();
      })
      .then((result) => {
        // Update Portfolio collection
        Meteor.call('coreContracts.setNotional',
          doc._id,
          result.toNumber()
        );
        return coreContract.calcSharePrice();
      })
      .then((result) => {
        // Update Portfolio collection
        Meteor.call('coreContracts.setSharePrice',
          doc._id,
          result.toNumber()
        );
      });
    } else if (selectedOption === '1') {
      console.log(weiShareAmount)
      const roundingError = 0.01;

      coreContract.calcSharePrice()
      .then((result) => {
        console.log(`sharePrice: ${result.toString()}`)
        console.log(weiShareAmount * result.toString() / constants.ether * (1.0 - roundingError))
        return coreContract.annihilateShares(weiShareAmount, weiShareAmount * result.toString() / SolKeywords.ether * (1.0 - roundingError), {from: managerAddress });
      })
      .then((result) => {
        Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
        //TODO insert tx w ${result} as txhash
        return coreContract.totalSupply();
      })
      .then((result) => {
        // Update Portfolio collection
        Meteor.call('coreContracts.setNotional',
          doc._id,
          result.toNumber()
        );
        return coreContract.calcSharePrice();
      })
      .then((result) => {
        // Update Portfolio collection
        Meteor.call('coreContracts.setSharePrice',
          doc._id,
          result.toNumber()
        );
      });
    } else {
      console.log('Error invstingSelected value');
    }
  },
});
