import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { Wallets } from '/imports/api/wallets.js';
// Components
import '/imports/ui/components/welcome/welcome_list.js';
// Corresponding html file
import './welcome.html';


Template.pagesWelcome.onCreated(() => {
  Meteor.subscribe('wallets');
});

Template.pagesWelcome.helpers({
  walletCount() {
    return Wallets.find({ owner: Meteor.userId() }).count();
  },
});

Template.pagesWelcome.onRendered(() => {
  $('.modal-trigger').leanModal({
    dismissible: false,
    opacity: 0.5, // Opacity of modal background
    in_duration: 300, // Transition in duration
    out_duration: 200, // Transition out duration
  });
});


Template.pagesWelcome.events({
});
