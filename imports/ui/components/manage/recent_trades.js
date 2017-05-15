import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// NPM imports
import moment from 'moment';
// Collections
import Trades from '/imports/api/trades.js';
// Utils
import { convertFromTokenPrecision } from '/imports/lib/assets/utils/functions.js';

// Corresponding html file
import './recent_trades.html';

Template.recent_trades.onCreated(() => {});

Template.recent_trades.helpers({
  more: false,
  currentAssetPair: () => Session.get('currentAssetPair'),
  baseTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],
  quoteTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  getRecentTrades: () => Trades.find(),
  buyOrSell: buyTokenSymbol =>
    (buyTokenSymbol === (Session.get('currentAssetPair') || '---/---').split('/')[1]
    ? 'buy' : 'sell'
  ),
  getPrice(trade) {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

    if(trade.buy.symbol === baseTokenSymbol) return (convertFromTokenPrecision(trade.sell.howMuch, trade.sell.precision) / convertFromTokenPrecision(trade.buy.howMuch, trade.buy.precision)).toFixed(4);
    else return (convertFromTokenPrecision(trade.buy.howMuch, trade.buy.precision) / convertFromTokenPrecision(trade.sell.howMuch, trade.sell.precision)).toFixed(4);

  },
  getVolume(trade) {
  const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

    if(trade.buy.symbol === baseTokenSymbol) return convertFromTokenPrecision(trade.sell.howMuch, trade.sell.precision);
    else return convertFromTokenPrecision(trade.buy.howMuch, trade.buy.precision);

  },
  formatDate: date => moment(date).format('D.M.YYYY HH:mm:ss'),
});

Template.recent_trades.onRendered(() => {});

Template.recent_trades.events({});
