import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import contract from 'truffle-contract';
import VersionJson from '@melonproject/protocol/build/contracts/Version.json';
// Smart Contracts
import web3 from '/imports/lib/web3/client';
import addressList from '/imports/melon/interface/addressList';

import './portalNew.html';

const Version = contract(VersionJson);


Template.portalNew.onCreated(() => {
  Session.set('showModal', true);
  Meteor.subscribe('vaults');
  Meteor.subscribe('universes');
});

Template.portalNew.helpers({
  ...addressList,
});

Template.portalNew.onRendered(() => {});

Template.portalNew.events({
  'shown.bs.modal #myModal': (event) => {
    // Prevent default browser form submit
    event.preventDefault();
  },
  'change form#new_portfolio #universe_select': (event) => {
    // Get value from form element
    const target = event.target;
    if (target.value === 'melon') {
      // Materialize.toast('Good choice. Now verifiy the accuracy of this registar', 4000, 'blue');
      Session.set('selectedRegistarIsMelon', true);
    }
  },
  'submit form#new_portfolio': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();
    Version.setProvider(web3.currentProvider);

    if (!templateInstance.find('input#portfolio_name').value) {
      alert('Please enter a portfolio name.');
      return;
    }
    // Description input parameters
    const PORTFOLIO_NAME = templateInstance.find('input#portfolio_name').value;
    const PORTFOLIO_SYMBOL = 'MLN-P';
    const PORTFOLIO_DECIMALS = 18;
    // Deploy
    const versionContract = Version.at(addressList.version);
    Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });
    versionContract.createVault(
      PORTFOLIO_NAME,
      PORTFOLIO_SYMBOL,
      PORTFOLIO_DECIMALS,
      /* TODO take below address from user input */
      addressList.universe,
      addressList.subscribe,
      addressList.redeem,
      addressList.riskMgmt,
      addressList.managementFee,
      addressList.performanceFee,
      { from: Session.get('selectedAccount') },
    )
    .then((result) => {
      let id;
      for (let i = 0; i < result.logs.length; i += 1) {
        if (result.logs[i].event === 'VaultUpdate') {
          id = result.logs[i].args.id.toNumber();
          console.log('Vault has been created');
          console.log(`Vault id: ${id}`);
          Session.set('isNew', true);
          toastr.success('Fund successfully created! You can now invest in your fund!');
        }
      }
      return versionContract.getVault(id);
    })
    .then((info) => {
      const address = info[0];
      Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
      FlowRouter.go(`/fund/${address}`);
    }).catch((err) => {
      toastr.error('Oops, an error has occurred. Please verify your fund informations.');
      Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
      throw err;
    });
  },
});

Template.disclaimerModal.events({
  'click button#okDisclaimer': (event) => {
    Session.set('showModal', false);
  },
});
