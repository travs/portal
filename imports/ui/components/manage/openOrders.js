// Meteor imports
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// NPM imports
import moment from 'moment';
// Utils
import addressList from '/imports/melon/interface/addressList';
import convertFromTokenPrecision from '/imports/melon/interface/helpers/convertFromTokenPrecision';

// Collections
import Orders from '/imports/api/orders';

// Corresponding html file
import './openOrders.html';


// Contracts
import contract from 'truffle-contract';
import CoreJson from '/imports/melon/contracts/Core.json'; // Get Smart Contract JSON
import ExchangeJson from '/imports/melon/contracts/ExchangeProtocol.json';


Template.openOrders.onCreated(() => {});

Template.openOrders.helpers({
  more: false,
  currentAssetPair: () => Session.get('currentAssetPair'),
  baseTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],
  quoteTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  getOpenOrders() {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    const owner = Session.get('fromPortfolio')
      ? FlowRouter.getParam('address')
      : Session.get('selectedAccount');

    return Orders.find({
      owner,
      isActive: true,
      $or: [
        { 'buy.symbol': { $in: [baseTokenSymbol, quoteTokenSymbol] } },
        { 'sell.symbol': { $in: [baseTokenSymbol, quoteTokenSymbol] } },
      ],
    });
  },
  buyOrSell(order) {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

    if (order.buy.symbol === baseTokenSymbol) return 'Buy';
    return 'Sell';
  },
  getPrice(order) {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

    if (order.buy.symbol === baseTokenSymbol) return (convertFromTokenPrecision(order.sell.howMuch, order.sell.precision) / convertFromTokenPrecision(order.buy.howMuch, order.buy.precision)).toFixed(4);
    return (convertFromTokenPrecision(order.buy.howMuch, order.buy.precision) / convertFromTokenPrecision(order.sell.howMuch, order.sell.precision)).toFixed(4);
  },
  getVolume(order) {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    if (order.buy.symbol === baseTokenSymbol) return convertFromTokenPrecision(order.buy.howMuch, order.buy.precision);
    return convertFromTokenPrecision(order.sell.howMuch, order.sell.precision);
  },
  formatDate: date => moment(date).format('D.M.YYYY HH:mm:ss'),
});

Template.openOrders.onRendered(() => {});

Template.openOrders.events({
  'click .js-cancel': (event, order) => {
    const Core = contract(CoreJson);
    Core.setProvider(web3.currentProvider);
    const coreAddress = FlowRouter.getParam('address');
    const coreContract = Core.at(coreAddress);
    const Exchange = contract(ExchangeJson);
    Exchange.setProvider(web3.currentProvider);
    const ExchangeAddress = FlowRouter.getParam('address');
    const exchangeContract = Exchange.at(ExchangeAddress);
    const managerAddress = Session.get('selectedAccount');

    if (Session.get('fromPortfolio')) {
      coreContract.cancelOrder(addressList.exchange, event.currentTarget.dataset.id, { from: managerAddress }).then((result) => {
        console.log(result);
      });
    } else {
      exchangeContract.cancel(event.currentTarget.dataset.id, { from: managerAddress }).then((result) => {
        console.log(result);
      });
    }
  },
});

