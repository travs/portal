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
  baseTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  getRecentTrades: () => Trades.find(),
  buyOrSell: buyTokenSymbol =>
    (buyTokenSymbol === (Session.get('currentAssetPair') || '---/---').split('/')[1]
    ? 'buy' : 'sell'
  ),
  getPrice(trade) {
    const baseTokenSymbol = (Session.get('currentAssetPair') || '---/---')[1];
    const details = trade.buy.symbol === baseTokenSymbol
      ? trade.buy : trade.sell;

    return details.price;
  },
  getVolume(trade) {
    const baseTokenSymbol = (Session.get('currentAssetPair') || '---/---')[1];
    const details = trade.buy.symbol === baseTokenSymbol
      ? trade.buy : trade.sell;

    return convertFromTokenPrecision(details.howMuch, details.precision);
  },
  formatDate: date => moment(date).format('D.M.YYYY HH:mm:ss'),
});

Template.recent_trades.onRendered(() => {});

Template.recent_trades.events({});
