import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import select2 from 'select2';
import specs from '/imports/melon/interface/helpers/specs';
import { $ } from 'meteor/jquery';
// Collections
import Vaults from '/imports/api/vaults';
// Corresponding html file
import './manageSettings.html';


Template.manageSettings.onCreated(() => {
  Meteor.subscribe('vaults');
});


Template.manageSettings.helpers({
  currencies: () => ["ETH", "BTC", "EUR", "USD"],
});


Template.manageSettings.onRendered(() => {
  $('select').select2();
});


Template.manageSettings.events({
  'shown.bs.modal #myModal': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();
  },
  'change select#referencecurrency': (event, templateInstance) => {
    Session.set('referenceCurrency', templateInstance.find('select#referencecurrency').value);
    console.log(Session.get('referenceCurrency'));
    switch (Session.get('referenceCurrency')) {
      case 'ETH': {
        EthTools.setUnit('ether');
        break;
      }
      case 'BTC': {
        EthTools.setUnit('btc');
        break;
      }
      case 'EUR': {
        EthTools.setUnit('eur');
        break;
      }
      case 'USD': {
        EthTools.setUnit('usd');
        break;
      }
      default: return 'Error';
    }
  },
  'click .manage': (event, templateInstance) => {},
  'click button#delete': () => {
    const managerAddress = Session.get('selectedAccount');
    const doc = Vaults.findOne({ managerAddress });
    if ((doc === undefined || managerAddress === undefined)) {
      return false;
    }
    Meteor.call('vaults.removeById', doc._id);
    // TODO close modal
    return true;
  },
});
