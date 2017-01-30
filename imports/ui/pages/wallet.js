import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Components
//TODO remove
import '/imports/ui/components/wallet/wallet_list.js';
import '/imports/ui/components/wallet/wallet_overview.js';
import '/imports/ui/components/wallet/wallet_contents.js';
import '/imports/ui/components/wallet/manage_settings.js';
// Corresponding html file
import './wallet.html';


Template.wallet.onCreated(() => {});


Template.wallet.helpers({});


Template.wallet.onRendered(() => {});
