import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
// Collections
import { Cores } from '/imports/api/cores';
import { Universes } from '/imports/api/modules';
// Smart Contracts
import contract from 'truffle-contract';
import VersionJson from '/imports/lib/assets/contracts/Version.json';
import CoreJson from '/imports/lib/assets/contracts/Core.json';

import './portal_new.html';

const Version = contract(VersionJson);
const Core = contract(CoreJson);
// Creation of contract object
Version.setProvider(web3.currentProvider);
Core.setProvider(web3.currentProvider);


Template.portal_new.onCreated(() => {
  Meteor.subscribe('cores');
  Meteor.subscribe('universes');
});


Template.portal_new.helpers({});


Template.portal_new.onRendered(() => {});


Template.portal_new.events({
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
    if (!templateInstance.find('input#portfolio_name').value) {
      alert('Please enter a portfolio name.');
      return;
    }
    // Description input parameters
    const PORTFOLIO_NAME = templateInstance.find('input#portfolio_name').value;
    const PORTFOLIO_SYMBOL = 'MLN-P';
    const PORTFOLIO_DECIMALS = 18;

    // Deploy
    const versionContract = Version.at(Session.get('versionContractAddress'));
    Session.set('NetworkStatus', { isInactive: false, isMining: true, isError: false, isMined: false });
    versionContract.createCore(
      PORTFOLIO_NAME,
      PORTFOLIO_SYMBOL,
      PORTFOLIO_DECIMALS,
      Session.get('universeContractAddress'),
      Session.get('subscribeContractAddress'),
      Session.get('redeemContractAddress'),
      Session.get('riskMgmtContractAddress'),
      Session.get('managmentFeeContractAddress'),
      Session.get('performanceFeeContractAddress'),
      { from: Session.get('clientManagerAccount') }
    )
    .then((result) => {
      let id;
      for (let i = 0; i < result.logs.length; i += 1) {
        if (result.logs[i].event === 'CoreUpdate') {
          id = result.logs[i].args.id.toNumber();
          console.log('Core has been created');
          console.log(`Core id: ${id}`);
          Meteor.call('cores.syncCoreById', id);
          Session.set('isNew', true);
          toastr.success('Fund successfully created!');
        }
      }
      return versionContract.getCore(id);
    })
    .then((info) => {
      const [address, owner, , , , ] = info;
      Meteor.call('universes.insert',
        Session.get('universeContractAddress'),
        address,
        owner
      );
      Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
      FlowRouter.go('/portfolio/'+address);
    }).catch((err) => {
      toastr.error('Oops, an error has occured. Please verify your fund informations.');
      Session.set('NetworkStatus', { isInactive: false, isMining: false, isError: false, isMined: true });
      throw err;
    });
  },
});
