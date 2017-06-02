import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// Components
import '/imports/ui/components/wallet/wallet_overview';
import '/imports/ui/components/wallet/wallet_contents';
import '/imports/ui/components/wallet/manage_settings';
// Corresponding html file
import './wallet.html';


Template.wallet.onCreated(() => {});


Template.wallet.helpers({});


Template.wallet.onRendered(() => {
  // Use Meteor.defer() to create chart after DOM is ready:
  Meteor.defer(() => {
    /*
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
    */
  });
});
