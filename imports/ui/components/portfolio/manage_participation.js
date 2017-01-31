import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Materialize } from 'meteor/poetic:materialize-scss';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
// Collections
import { CoreContracts } from '/imports/api/coreContracts';
// Contracts
import Core from '/imports/lib/assets/contracts/Core.sol.js';
import constants from '/imports/lib/assets/utils/constants.js';

import './manage_participation.html';


Template.manage_participation.onCreated(() => {
  // TODO update coreContracts param
  Meteor.subscribe('coreContracts');

  Template.instance().typeValue = new ReactiveVar(0);
  // Creation of contract object
  Core.setProvider(web3.currentProvider);
});


Template.manage_participation.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = CoreContracts.findOne({ address });
    return (doc === undefined || address === undefined) ? '' : doc;
  },
  formattedSharePrice() {
    const address = FlowRouter.getParam('address');
    const doc = CoreContracts.findOne({ address });
    if (doc !== undefined) {
      return web3.fromWei(doc.sharePrice, 'ether');
    }
    return '';
  },
  selectedTypeName() {
    switch (Template.instance().typeValue.get()) {
      case 0: return 'Invest';
      case 1: return 'Redeem';
      default: return 'Error';
    }
  },
});

Template.manage_participation.onRendered(() => {
  Template.instance().$('select').material_select();
  Template.instance().$('label').addClass('active');
});


Template.manage_participation.events({
  'change select#type': (event, templateInstance) => {
    const currentlySelectedTypeValue = parseFloat(templateInstance.find('select#type').value, 10);
    Template.instance().typeValue.set(currentlySelectedTypeValue);
  },
  'input input#price': (event, templateInstance) => {
    const price = parseFloat(templateInstance.find('input#price').value, 10);
    const volume = parseFloat(templateInstance.find('input#volume').value, 10);
    const total = parseFloat(templateInstance.find('input#total').value, 10);
    if (!isNaN(volume)) templateInstance.find('input#total').value = price * volume;
    else if (!isNaN(total)) templateInstance.find('input#volume').value = total / price;
  },
  'input input#volume': (event, templateInstance) => {
    const price = parseFloat(templateInstance.find('input#price').value, 10);
    const volume = parseFloat(templateInstance.find('input#volume').value, 10);
    /* eslint no-param-reassign: ["error", { "props": false }]*/
    templateInstance.find('input#total').value = price * volume;
  },
  'input input#total': (event, templateInstance) => {
    const price = parseFloat(templateInstance.find('input#price').value, 10);
    const total = parseFloat(templateInstance.find('input#total').value, 10);
    /* eslint no-param-reassign: ["error", { "props": false }]*/
    templateInstance.find('input#volume').value = total / price;
  },
  'click .manage': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from template instance
    const type = parseFloat(templateInstance.find('select#type').value, 10);
    const price = parseFloat(templateInstance.find('input#price').value, 10);
    const volume = parseFloat(templateInstance.find('input#volume').value, 10);
    const total = parseFloat(templateInstance.find('input#total').value, 10);
    if (isNaN(type) || isNaN(price) || isNaN(volume) || isNaN(total)) {
      Materialize.toast('Please fill out the form', 4000, 'blue');
      return;
    }

    // Init
    const managerAddress = Session.get('clientMangerAccount');
    const doc = CoreContracts.findOne({ managerAddress });
    if (doc === undefined) { Materialize.toast('Undefined document', 4000, 'red'); return; }
    const coreAddress = doc.address;
    const coreContract = Core.at(coreAddress);

    // Is mining
    Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });

    // From price to volume of shares
    const weiPrice = web3.toWei(price, 'ether');
    const weiVolume = web3.toWei(volume, 'ether');
    const weiTotal = web3.toWei(total, 'ether');

    // Invest or Redeem
    // TODO use switch as above
    if (type === 0) {
      coreContract.createShares(weiTotal, { value: weiVolume, from: managerAddress }).then((result) => {
        Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
        // TODO insert txHash into appropriate collection
        console.log(`Tx Hash: ${result}`);
        // TODO update coreContracts collection
        Meteor.call('assets.sync', coreAddress); // Upsert Asset Collection
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
      // TODO clean up
      .then((result) => {
        // Update Portfolio collection
        console.log(`Shareprice as from contract: ${result.toNumber()}`)
        Meteor.call('coreContracts.setSharePrice',
          doc._id,
          result.toNumber()
        );
      });
    } else if (type === 1) {
      coreContract.annihilateShares(weiTotal, weiVolume, { from: managerAddress }).then((result) => {
        Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
        // TODO insert txHash into appropriate collection
        console.log(`Tx Hash: ${result}`);
        // TODO update coreContracts collection
        Meteor.call('assets.sync', coreAddress); // Upsert Asset Collection
        return coreContract.totalSupply();
      })
      // TODO clean up
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
    } else {
      console.log('Error invstingSelected value');
    }
  },
});
