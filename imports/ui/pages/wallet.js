import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Components
import '/imports/ui/components/summary/network_summary.js';
import '/imports/ui/components/summary/executive_summary.js';
import '/imports/ui/components/wallet/wallet_list.js';
import '/imports/ui/components/wallet/wallet_manage.js';
// Corresponding html file
import './wallet.html';


Template.wallet.onCreated(() => { });


Template.wallet.helpers({
});


Template.wallet.onRendered(() => {
});
