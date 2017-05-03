import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';
import specs from '/imports/lib/assets/utils/specs.js';

import cc from 'cryptocompare';


Meteor.startup(() => {
  Session.set('NetworkStatus', {
    isInactive: true,
    isMining: false,
    isError: false,
    isMined: false,
  });

  const referenceCurrency = Session.get('referenceCurrency');

  cc.priceFull(['ETH'], ['USD', 'EUR'])
  .then(prices => {
    console.log(prices)
    // {
    //   BTC: {
    //     USD: {
    //       TYPE: '5',
    //       MARKET: 'CCCAGG',
    //       FROMSYMBOL: 'BTC',
    //       TOSYMBOL: 'USD',
    //       FLAGS: '4',
    //       PRICE: 1152.42,
    //       LASTUPDATE: 1487865689,
    //       LASTVOLUME: 0.21,
    //       LASTVOLUMETO: 242.20349999999996,
    //       LASTTRADEID: 1224703,
    //       VOLUME24HOUR: 53435.45299122338,
    //       VOLUME24HOURTO: 60671593.843186244,
    //       OPEN24HOUR: 1119.31,
    //       HIGH24HOUR: 1170,
    //       LOW24HOUR: 1086.641,
    //       LASTMARKET: 'itBit',
    //       CHANGE24HOUR: 33.11000000000013,
    //       CHANGEPCT24HOUR: 2.958072383879366,
    //       SUPPLY: 16177825,
    //       MKTCAP: 18643649086.5
    //     },
    //     EUR: ...
    //   },
    //   ETH: ...
    // }
  })
  .catch(console.error)
  // Set 24h Change
  // TODO change is relative to Dollar!
  // TODO check and handle statusCode

  // TODO: Reenable this: https://github.com/melonproject/portal/issues/38
  /*
  HTTP.get('https://api.coinmarketcap.com/v1/ticker/ethereum/', (error, result) => {
    if (!error) Session.set('ethChange24h', result.data[0].percent_change_24h);
  });
  HTTP.get('https://api.coinmarketcap.com/v1/ticker/bitcoin/', (error, result) => {
    if (!error) Session.set('btcChange24h', result.data[0].percent_change_24h);
  });
  HTTP.get('https://api.coinmarketcap.com/v1/ticker/augur/', (error, result) => {
    if (!error) Session.set('repChange24h', result.data[0].percent_change_24h);
  });
  */
  Session.set('eurChange24h', '0');
});
