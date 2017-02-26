import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import d3 from 'd3';
import MG from 'metrics-graphics';
import select2 from 'select2';
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


Template.manage.onRendered(() => {
  $('select').select2();
  // Use Meteor.defer() to create chart after DOM is ready:
  Meteor.defer(() => {
    d3.json('data/fake_users1.json', (data) => {
      data = MG.convert.date(data, 'date');
      MG.data_graphic({
        title: '',
        description: 'Wallet Chart',
        data: data,
        full_width: true,
        height: 250,
        right: 40,
        color: '#1189c6',
        target: '#charts',
        x_accessor: 'date',
        y_accessor: 'value'
      });
    });
  });
});
