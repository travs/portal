import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';
import { EthTools } from 'meteor/ethereum:tools';
import cc from 'cryptocompare';

import specs from '/imports/melon/interface/helpers/specs.js';


EthTools.ticker.start();
EthTools.setUnit('ether');
Session.set('referenceCurrency', 'ETH')

// CONSTANTS

const PRECISION = 4;
const CCREFERENCECURRENCY = 'ETH';
const CCMARKET = 'Kraken';

// FUNCTIONS

const invertNumber = number => 1.0 / number;

const setIntradayChange = (referenceCurrency) => {

  // By definition
  Session.set('ethChange24h', '±0.0');

  cc.generateAvg(CCREFERENCECURRENCY, 'EUR', CCMARKET)
  .then(data => Session.set('eurChange24h', data.CHANGEPCT24HOUR.toFixed(PRECISION)))
  .catch(console.error);

  cc.generateAvg(CCREFERENCECURRENCY, 'EUR', CCMARKET)
  .then(data => Session.set('eurChange24h', data.CHANGEPCT24HOUR.toFixed(PRECISION)))
  .catch(console.error);

  cc.generateAvg(CCREFERENCECURRENCY, 'BTC', CCMARKET)
  .then(data => Session.set('btcChange24h', data.CHANGEPCT24HOUR.toFixed(PRECISION)))
  .catch(console.error);

  cc.generateAvg('MLN', CCREFERENCECURRENCY, CCMARKET)
  .then(data => Session.set('mlnChange24h', invertNumber(data.CHANGEPCT24HOUR).toFixed(PRECISION)))
  .catch(console.error);

  cc.generateAvg('REP', CCREFERENCECURRENCY, CCMARKET)
  .then(data => Session.set('repChange24h', invertNumber(data.CHANGEPCT24HOUR).toFixed(PRECISION)))
  .catch(console.error);
}

// ON STARTUP

Meteor.startup(() => {
  Session.set('NetworkStatus', {
    isInactive: true,
    isMining: false,
    isError: false,
    isMined: false,
  });

  // TODO handle case where CCREFERENCECURRENCY !== 'ETH'
  setIntradayChange(CCREFERENCECURRENCY);
});
