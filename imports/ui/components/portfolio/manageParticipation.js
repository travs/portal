import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import select2 from 'select2';
import contract from 'truffle-contract';
import BigNumber from 'bignumber.js';
// Contracts
import VaultJson from '@melonproject/protocol/build/contracts/Vault.json'; // Get Smart Contract JSON
import EtherTokenJson from '@melonproject/protocol/build/contracts/EtherToken.json';

import web3 from '/imports/lib/web3/client';
import addressList from '/imports/melon/interface/addressList';
// Collections
import Vaults from '/imports/api/vaults';

import convertFromTokenPrecision from '/imports/melon/interface/helpers/convertFromTokenPrecision';

import store from '/imports/startup/client/store';
import { creators } from '/imports/redux/vault';

import './manageParticipation.html';

const Vault = contract(VaultJson); // Set Provider

Template.manageParticipation.onCreated(() => {
  // TODO update vaults param
  const template = Template.instance();
  template.sharePrice = new ReactiveVar(0);
  template.typeValue = new ReactiveVar(0);
  Meteor.subscribe('vaults');
  store.subscribe(() => {
    const currentState = store.getState().vault;
    template.sharePrice.set(
      new BigNumber(currentState.sharePrice || 0).toString(),
    );
  });
  store.dispatch(creators.requestCalculations(FlowRouter.getParam('address')));
});

Template.manageParticipation.helpers({
  getPortfolioDoc() {
    const address = FlowRouter.getParam('address');
    const doc = Vaults.findOne({ address });
    return doc === undefined || address === undefined ? '' : doc;
  },
  formattedSharePrice() {
    const address = FlowRouter.getParam('address');
    const doc = Vaults.findOne({ address });
    if (doc !== undefined) {
      if (!doc.sharePrice) return 1;
      return web3.fromWei(doc.sharePrice, 'ether');
    }
  },
  getSharePrice() {
    const template = Template.instance();
    return template.sharePrice.get();
  },
  selectedTypeName() {
    switch (Template.instance().typeValue.get()) {
      case 0:
        return 'Invest';
      case 1:
        return 'Redeem';
      default:
        return 'Error';
    }
  },
});

Template.manageParticipation.onRendered(() => {
  $('select').select2();
});

Template.manageParticipation.events({
  'change select#type': (event, templateInstance) => {
    const currentlySelectedTypeValue = parseFloat(
      templateInstance.find('select#type').value,
      10,
    );
    Template.instance().typeValue.set(currentlySelectedTypeValue);
  },
  'input input#price': (event, templateInstance) => {
    const price = parseFloat(templateInstance.find('input#price').value, 10);
    const volume = parseFloat(templateInstance.find('input#volume').value, 10);
    const total = parseFloat(templateInstance.find('input#total').value, 10);
    if (!isNaN(volume)) {
      templateInstance.find('input#total').value = price * volume;
    } else if (!isNaN(total)) {
      templateInstance.find('input#volume').value = total / price;
    }
  },
  'input input#volume': (event, templateInstance) => {
    const price = parseFloat(
      templateInstance.find('input#price').value || 0,
      10,
    );
    const volume = parseFloat(
      templateInstance.find('input#volume').value || 0,
      10,
    );
    console.log('price: ', price, 'volume: ', volume);
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
      // TODO replace toast
      // Materialize.toast('Please fill out the form', 4000, 'blue');
      return;
    }

    // Init
    const managerAddress = Session.get('selectedAccount');
    if (managerAddress === undefined) {
      // TODO replace toast
      // Materialize.toast('Not connected, use Parity, Mist or MetaMask', 4000, 'blue');
      return;
    }
    const vaultAddress = FlowRouter.getParam('address');
    const doc = Vaults.findOne({ address: vaultAddress });
    // Check if core is stored in database
    if (doc === undefined) {
      // TODO replace toast
      // Materialize.toast(`Portfolio could not be found\n ${vaultAddress}`, 4000, 'red');
      return;
    }

    const vaultContract = Vault.at(vaultAddress);
    Vault.setProvider(web3.currentProvider);

    // Is mining
    Session.set('NetworkStatus', {
      isInactive: false,
      isMining: true,
      isError: false,
      isMined: false,
    });

    // From price to volume of shares
    const weiPrice = web3.toWei(price, 'ether');
    const baseUnitVolume = web3.toWei(volume, 'ether');
    const weiTotal = web3.toWei(total, 'ether');

    const EtherToken = contract(EtherTokenJson);
    EtherToken.setProvider(web3.currentProvider);
    const EtherTokenContract = EtherToken.at(addressList.etherToken);

    switch (type) {
      // Invest case
      case 0:
        EtherTokenContract.deposit({ from: managerAddress, value: weiTotal })
          .then(result =>
            EtherTokenContract.approve(vaultAddress, baseUnitVolume, {
              from: managerAddress,
            }),
          )
          .then(result =>
            vaultContract.createShares(baseUnitVolume, { from: managerAddress }),
          )
          .then((result) => {
            store.dispatch(
              creators.requestParticipation(vaultAddress, managerAddress),
            );
            store.dispatch(creators.requestCalculations(vaultAddress));

            Session.set('NetworkStatus', {
              isInactive: false,
              isMining: false,
              isError: false,
              isMined: true,
            });
            toastr.success('Shares successfully created!');
            console.log(`Shares successfully created. Tx Hash: ${result}`);
            Meteor.call('assets.sync', vaultAddress); // Upsert Assets Collection
            Meteor.call('vaults.syncVaultById', doc.id);
            return vaultContract.totalSupply();
          })
          .catch((error) => {
            console.log(error);
            Session.set('NetworkStatus', {
              isInactive: false,
              isMining: false,
              isError: true,
              isMined: false,
            });
            toastr.error(
              'Oops, an error has occurred. Please verify that your holdings allow you to invest in this fund!',
            );
          });
        templateInstance.find('input#total').value = '';
        templateInstance.find('input#volume').value = '';
        window.scrollTo(0, 0);
        break;

      // Redeem case
      case 1:
        vaultContract
          .annihilateShares(baseUnitVolume, weiTotal, { from: managerAddress })
          .then((result) => {
            store.dispatch(
              creators.requestParticipation(vaultAddress, managerAddress),
            );
            store.dispatch(creators.requestCalculations(vaultAddress));
            Session.set('NetworkStatus', {
              isInactive: false,
              isMining: false,
              isError: false,
              isMined: true,
            });
            toastr.success('Shares successfully redeemed!');
            console.log(`Shares annihilated successfully. Tx Hash: ${result}`);
            Meteor.call('assets.sync', vaultAddress); // Upsert Assets Collection
            templateInstance.find('input#total').value = '';
            templateInstance.find('input#volume').value = '';
            return vaultContract.totalSupply();
          })
          .catch((error) => {
            console.log(error);
            Session.set('NetworkStatus', {
              isInactive: false,
              isMining: false,
              isError: true,
              isMined: false,
            });
            toastr.error('Oops, an error has occurred. Please try again.');
          });
      default:
        return 'Error';
    }
  },
});
