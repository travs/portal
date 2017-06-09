// / Remark: Code mostly taken from: https://github.com/makerdao/maker-market
import { Meteor } from 'meteor/meteor';
// Collections
import Vaults from '/imports/api/vaults';
import Orders from '/imports/api/orders';
import Trades from '/imports/api/trades';

// EXECUTION
Meteor.startup(() => {
  Vaults.remove({});
  Vaults.sync();
  Vaults.watch();

  Orders.remove({});
  Orders.sync();
  Orders.watch();

  Trades.remove({});
  Trades.watch();
});
