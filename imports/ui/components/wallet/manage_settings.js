import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import select2 from 'select2';
import specs from '/imports/melon/interface/helpers/specs';
import { $ } from 'meteor/jquery';
// Collections
import { Cores } from '/imports/api/cores';
// Corresponding html file
import './manage_settings.html';


Template.manage_settings.onCreated(() => {
  Meteor.subscribe('cores');
});


Template.manage_settings.helpers({
   'currencies' : () => {
    return ["ETH", "BTC", "EUR", "USD"];
  }
});


Template.manage_settings.onRendered(() => {
  $('select').select2();
});


Template.manage_settings.events({
  'shown.bs.modal #myModal': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();
  },
  'change select#referencecurrency': (event, templateInstance) => {
    Session.set('referenceCurrency', templateInstance.find('select#referencecurrency').value)
    console.log(Session.get('referenceCurrency'));
    switch(Session.get('referenceCurrency')) {
      case "ETH": {
        EthTools.setUnit('ether');
        break;
      }
      case "BTC": {
        EthTools.setUnit('btc');
        break;
      }
      case "EUR": {
        EthTools.setUnit('eur');
        break;
      }
      case "USD": {
        EthTools.setUnit('usd');
        break;
      }
      default: return 'Error';
    }
  },
  'click .manage': (event, templateInstance) => {},
  'click button#delete': () => {
    const managerAddress = Session.get('selectedAccount');
    const doc = Cores.findOne({ managerAddress });
    if ((doc === undefined || managerAddress === undefined)) {
      return false;
    }
    Meteor.call('cores.removeById', doc._id);
    //TODO close modal
    return true;
  },
});
