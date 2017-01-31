import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Components
import '/imports/ui/components/manage/manage_overview.js';
import '/imports/ui/components/manage/manage_holdings.js';
import '/imports/ui/components/manage/orderbook_contents.js';
import '/imports/ui/components/manage/open_orders.js';
import '/imports/ui/components/manage/recent_trades.js';
// Corresponding html file
import './manage.html';


Template.manage.onCreated(() => {});


Template.manage.helpers({});


Template.manage.onRendered(() => {});
