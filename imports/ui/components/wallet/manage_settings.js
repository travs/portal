import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import select2 from 'select2';
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
    return ["BTC", "EUR", "USD", "ETH"];
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
  'click .manage': (event, templateInstance) => {
    // Prevent default browser form submit
    event.preventDefault();
    // const referenceCurrency = templateInstance.find('select#referencecurrency').value;
    Session.set('referenceCurrency', templateInstance.find('select#referencecurrency').value)
    console.log(Session.get('referenceCurrency'));

    switch(Session.get('referenceCurrency')) {
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
      case "ETH": {
        EthTools.setUnit('ether');
        break;
      }
      default: return 'Error';
    }


  },
  'click button#delete': () => {
    const managerAddress = Session.get('clientManagerAccount');
    const doc = Cores.findOne({ managerAddress });
    if ((doc === undefined || managerAddress === undefined)) {
      return false;
    }
    Meteor.call('cores.remove', doc._id);
    //TODO close modal
    return true;
  },
});
