/// Remark: Code mostly taken from: https://github.com/makerdao/maker-market
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { _ } from 'meteor/underscore';
// Collections
import { Cores } from '/imports/api/cores';
import { Orders } from '/imports/api/orders';

// EXECUTION
Meteor.startup(() => {
  Cores.sync();
  Orders.sync();
});
