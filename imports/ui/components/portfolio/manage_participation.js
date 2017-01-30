import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
// Collections
import { CoreContracts } from '/imports/api/coreContracts';
// Contracts
import Core from '/imports/lib/assets/contracts/Core.sol.js';
import constants from '/imports/lib/assets/utils/constants.js';


import './manage_participation.html';

// TODO rem eslint
/* eslint meteor/template-names: [2, "snake-case"]*/
Template.manage_participation.onCreated(() => {
  Meteor.subscribe('coreContracts');
  Template.instance().state = new ReactiveDict();
  Template.instance().state.set({ investingSelected: true });
  // Creation of contract object
  Core.setProvider(web3.currentProvider);
});


Template.manage_participation.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = CoreContracts.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
  isInvestingSelected() {
    if (Template.instance().state.get('investingSelected')) {
      return 'invest';
    }
    return 'redeem';
  },
});

Template.manage_participation.onRendered(() => {
  this.$('select').material_select();
});


Template.manage_participation.events({
  'change #select_type': (event, templateInstance) => {
    const type = templateInstance.find('#select_type').value;
    if (type === '0') Template.instance().state.set({ investingSelected: true });
    Template.instance().state.set({ investingSelected: false });
  },
  'change #input_amount': (event, templateInstance) => {
    const selectedAmount = templateInstance.find('#input_amount').value;
    if (selectedAmount !== undefined) {
      // TODO take real share price as input
      document.getElementById('input_price').value = '1.0';
    }
  },
  'click .manage': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const type = templateInstance.find('#select_type').value;
    const price = templateInstance.find('#input_price').value;
    const amount = templateInstance.find('#input_amount').value;
    if (!amount || !price) {
      Materialize.toast('Please fill out the form', 4000, 'blue');
    }

    // Is mining
    Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });

    // Init
    // TODO better handling of collection
    const doc = CoreContracts.findOne({ managerAddress: Session.get('clientMangerAccount') });
    const coreContract = Core.at(doc.address);
    const managerAddress = Session.get('clientMangerAccount');
    const weiAmount = web3.toWei(amount, 'ether');

    // From price to amount of shares
    const weiShareAmount = web3.toWei(amount * price, 'ether');

    // Invest or Redeem

    if (type === '0') {
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
        console.log(`Shareprice as from contract: ${result.toNumber()}`)
        Meteor.call('coreContracts.setSharePrice',
          doc._id,
          result.toNumber()
        );
      });
    } else if (type === '1') {
      console.log(weiShareAmount)
      const roundingError = 0.01;

      coreContract.calcSharePrice()
      .then((result) => {
        console.log(`price: ${result.toString()}`)
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
