const constants = require('./constants.js');
const specs = require('./specs.js');
const async = require('async');

import Exchange from '/imports/lib/assets/contracts/Exchange.sol.js';
Exchange.setProvider(web3.currentProvider);

// Offers

// Pre:
// Post:
exports.syncOffer = (id, callback) => {
  Exchange.at(Exchange.all_networks['3'].address).offers(id)
  .then((res) => {
    const [sellHowMuch, sellWhichTokenAddress, buyHowMuch, buyWhichTokenAddress, owner, active] = res;
    if (active) {
      const sellPrecision = specs.getTokenPrecisionByAddress(sellWhichTokenAddress);
      const buyPrecision = specs.getTokenPrecisionByAddress(buyWhichTokenAddress);
      const sellSymbol = specs.getTokenSymbolByAddress(sellWhichTokenAddress);
      const buySymbol = specs.getTokenSymbolByAddress(buyWhichTokenAddress);
      const buyHowMuchValue = buyHowMuch / (Math.pow(10, buyPrecision));
      const sellHowMuchValue = sellHowMuch / (Math.pow(10, sellPrecision));
      const offer = {
        id,
        owner,
        buyWhichTokenAddress,
        buyWhichToken: buySymbol,
        sellWhichTokenAddress,
        sellWhichToken: sellSymbol,
        buyHowMuch: buyHowMuchValue.toString(10),
        sellHowMuch: sellHowMuchValue.toString(10),
        ask_price: buyHowMuchValue / sellHowMuchValue,
        bid_price: sellHowMuchValue / buyHowMuchValue,
      };
      callback(null, offer);
    } else {
      callback('Not active', undefined);
    }
  });
};

// Pre:
// Post:
exports.sync = (callback) => {
  Exchange.at(Exchange.all_networks['3'].address).lastOfferId()
  .then((result) => {
    const numOffers = result.toNumber();
    console.log(`numOffers: ${numOffers}`)
    async.times(numOffers, (id, callbackMap) => {
      this.syncOffer(id + 1, (err, offer) => {
        if (!err) {
          callbackMap(null, offer);
        } else if (err == 'Not active') {
          callbackMap(null, undefined);
        } else {
          callbackMap(err, undefined);
        }
      });
    }, (err, offers) => {
      callback(null, offers);
    });
  });
};
