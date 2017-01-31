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
  isInvestingSelected() {
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
    const currentlySelectedTypeValue = parseInt(templateInstance.find('select#type').value, 10);
    Template.instance().typeValue.set(currentlySelectedTypeValue);
  },
  'input input#price': (event, templateInstance) => {
    const price = parseInt(templateInstance.find('input#price').value, 10);
    // TODO
  },
  'input input#volume': (event, templateInstance) => {
    const price = parseInt(templateInstance.find('input#price').value, 10);
    const volume = parseInt(templateInstance.find('input#volume').value, 10);
    /* eslint no-param-reassign: ["error", { "props": false }]*/
    templateInstance.find('input#total').value = price * volume;
  },
  'input input#total': (event, templateInstance) => {
    const price = parseInt(templateInstance.find('input#price').value, 10);
    const total = parseInt(templateInstance.find('input#total').value, 10);
    /* eslint no-param-reassign: ["error", { "props": false }]*/
    templateInstance.find('input#volume').value = total / price;
  },
  'click .manage': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from template instance
    const type = templateInstance.find('select#type').value;
    const price = templateInstance.find('input#price').value;
    const volume = templateInstance.find('input#volume').value;
    if (!volume || !price) {
      Materialize.toast('Please fill out the form', 4000, 'blue');
    }

    // Is mining
    Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });

    // Init

    // const doc = CoreContracts.findOne({ managerAddress: Session.get('clientMangerAccount') });
    // const coreContract = (doc === undefined || Session.get('clientMangerAccount') === undefined) ? undefined : Core.at(doc.address);
    //
    // // coreContract.sharePrice().then((result) => {
    // //   console.log(result.toNumber())
    // // })
    //
    // console.log(Template.instance().find('input#volume'));
    const managerAddress = Session.get('clientMangerAccount');
    const weiAmount = web3.toWei(volume, 'ether');

    // From price to volume of shares
    const weiShareAmount = web3.toWei(volume * price, 'ether');

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
