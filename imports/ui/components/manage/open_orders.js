// Meteor imports
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// NPM imports
import moment from 'moment';
// Utils
import AddressList from '/imports/lib/ethereum/address_list.js';
import { convertFromTokenPrecision } from '/imports/lib/assets/utils/functions.js';
// Collections
import { Orders } from '/imports/api/orders.js';

// Corresponding html file
import './open_orders.html';


//Contracts
import contract from 'truffle-contract';
import CoreJson from '/imports/lib/assets/contracts/Core.json'; // Get Smart Contract JSON


Template.open_orders.onCreated(() => {});

Template.open_orders.helpers({
  more: false,
  currentAssetPair: () => Session.get('currentAssetPair'),
  baseTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[0],
  quoteTokenSymbol: () => (Session.get('currentAssetPair') || '---/---').split('/')[1],
  getOpenOrders() {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');
    const owner = Session.get('fromPortfolio')
      ? FlowRouter.getParam('address')
      : Session.get('clientManagerAccount');

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

    if(order.buy.symbol === baseTokenSymbol) return  'Buy'
    else return 'Sell'
}
,
  getPrice(order) {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

    if(order.buy.symbol === baseTokenSymbol) return (convertFromTokenPrecision(order.sell.howMuch, order.sell.precision) / convertFromTokenPrecision(order.buy.howMuch, order.buy.precision)).toFixed(4);
    else return (convertFromTokenPrecision(order.buy.howMuch, order.buy.precision) / convertFromTokenPrecision(order.sell.howMuch, order.sell.precision)).toFixed(4);

  },
  getVolume(order) {
    const [baseTokenSymbol, quoteTokenSymbol] = (Session.get('currentAssetPair') || '---/---').split('/');

    if(order.buy.symbol === baseTokenSymbol) return convertFromTokenPrecision(order.sell.howMuch, order.sell.precision);
    else return convertFromTokenPrecision(order.buy.howMuch, order.buy.precision);
  },
  formatDate: date => moment(date).format('D.M.YYYY HH:mm:ss'),
});

Template.open_orders.onRendered(() => {});

Template.open_orders.events({
  'click .js-cancel': (event, order) => {
    const Core = contract(CoreJson);
    Core.setProvider(web3.currentProvider);
    const coreAddress = FlowRouter.getParam('address');
    const coreContract = Core.at(coreAddress);
    const managerAddress = Session.get('clientManagerAccount');

    coreContract.cancelOrder(AddressList.Exchange, event.currentTarget.dataset.id, { from: managerAddress }).then((result) => {
      console.log(result);
    })

  }
});


