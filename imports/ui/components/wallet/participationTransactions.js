import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// NPM imports
import moment from 'moment';
// Collections
import Transactions from '/imports/api/transactions';
// Utils
import convertFromTokenPrecision from '/imports/melon/interface/helpers/convertFromTokenPrecision';

// Corresponding html file
import './participationTransactions.html';

Template.participationTransactions.onCreated(() => {
  Meteor.subscribe('transactions', FlowRouter.getParam('address'));
});

Template.participationTransactions.helpers({
  // more: false,
  // currentAssetPair: () => Session.get('currentAssetPair'),
  // baseTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],
  // quoteTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  getParticipationTransactions: () => {
    const managerAddress = FlowRouter.getParam('address');
    const trans = Transactions.find({}).fetch();
    console.log(trans);
    return trans;
    // return Transactions.find({
    //   manager: managerAddress,
    //   $or: [
    //     { transactionType: 'SharesCreated' },
    //     { transactionType: 'SharesAnnihilated' },
    //   ],
    // }).fetch();
  },
  // buyOrSell: buyTokenSymbol =>
  //   buyTokenSymbol === (Session.get('currentAssetPair') || '---/---').split('/')[1]
  //     ? 'buy'
  //     : 'sell',
  // getPrice(trade) {
  //   const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---')
  //     .split('/');

  //   if (trade.buy.symbol === baseTokenSymbol) {
  //     return (convertFromTokenPrecision(trade.sell.howMuch, trade.sell.precision) /
  //       convertFromTokenPrecision(trade.buy.howMuch, trade.buy.precision)).toFixed(4);
  //   }
  //   return (convertFromTokenPrecision(trade.buy.howMuch, trade.buy.precision) /
  //     convertFromTokenPrecision(trade.sell.howMuch, trade.sell.precision)).toFixed(4);
  // },
  // getVolume(trade) {
  //   const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---')
  //     .split('/');
  //   if (trade.buy.symbol === baseTokenSymbol) {
  //     return convertFromTokenPrecision(trade.buy.howMuch, trade.buy.precision);
  //   }
  //   return convertFromTokenPrecision(trade.sell.howMuch, trade.sell.precision);
  // },
  // formatDate: date => moment(date).format('D.M.YYYY HH:mm:ss'),
});

Template.participationTransactions.onRendered(() => {});

Template.participationTransactions.events({});
