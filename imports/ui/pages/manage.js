import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { Vaults } from '/imports/api/vaults';
import { Orders } from '/imports/api/orders';
import convertFromTokenPrecision from '/imports/melon/interface/helpers/convertFromTokenPrecision';
import '/imports/ui/components/manage/manageHoldings';
import '/imports/ui/components/manage/manageOverview';
import '/imports/ui/components/manage/openOrders';
import '/imports/ui/components/manage/orderBookContents';
import '/imports/ui/components/manage/recentTrades';
import './manage.html';

const calcBuyCumulativeVolume = (currentOrder) => {
  let beforeCurrent = true;

  return Orders.find(
    {
      isActive: true,
      'buy.price': { $gte: currentOrder.buy.price },
      'buy.symbol': currentOrder.buy.symbol,
      'sell.symbol': currentOrder.sell.symbol,
    },
    {
      sort: {
        'buy.price': -1,
        'buy.howMuch': 1,
        createdAt: 1,
      },
    },
  )
    .fetch()
    .reduce((accumulator, currentValue) => {
      let cumulativeBuyVolume = accumulator;
      if (beforeCurrent) cumulativeBuyVolume += currentValue.buy.howMuch;

      if (currentValue._id === currentOrder._id) {
        beforeCurrent = false;
      }

      return cumulativeBuyVolume;
    }, 0);
};

const calcSellCumulativeVolume = (currentOrder) => {
  let beforeCurrent = true;
  return Orders.find(
    {
      isActive: true,
      'sell.price': { $lte: currentOrder.sell.price },
      'sell.symbol': currentOrder.sell.symbol,
      'buy.symbol': currentOrder.buy.symbol,
    },
    {
      sort: {
        'sell.price': 1,
        'buy.howMuch': 1,
        createdAt: 1,
      },
    },
  )
    .fetch()
    .reduce((accumulator, currentValue) => {
      const cumulativeSellVolume = beforeCurrent
        ? accumulator + currentValue.sell.howMuch
        : accumulator;

      if (currentValue._id === currentOrder._id) {
        beforeCurrent = false;
      }

      return cumulativeSellVolume;
    }, 0);
};

Template.manage.onCreated(() => {});

Template.manage.helpers({});

Template.manage.onRendered(() => {
  $('select').select2();
});
