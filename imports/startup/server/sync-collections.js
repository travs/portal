// / Remark: Code mostly taken from: https://github.com/makerdao/maker-market
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { _ } from 'meteor/underscore';
// Collections
import { Cores } from '/imports/api/cores';
import { Orders } from '/imports/api/orders';
import Trades from '/imports/api/trades.js';

// EXECUTION
Meteor.startup(() => {
  // Cores.remove({});
  Cores.sync();
  // Orders.remove({});
  Orders.sync();
  Trades.remove({});
  Trades.watch();
});
