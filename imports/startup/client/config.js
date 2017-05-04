import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';
import { EthTools } from 'meteor/ethereum:tools';
import cc from 'cryptocompare';

import specs from '/imports/lib/assets/utils/specs.js';


Session.set('referenceCurrency', 'ETH')
EthTools.ticker.start();
EthTools.setUnit('ether');


Meteor.startup(() => {
  Session.set('NetworkStatus', {
    isInactive: true,
    isMining: false,
    isError: false,
    isMined: false,
  });

  // By definition
  Session.set('ethChange24h', '±0.0');

  cc.generateAvg(Session.get('referenceCurrency'), 'EUR', ['Kraken'])
  .then(data => Session.set('eurChange24h', data.CHANGEPCT24HOUR.toPrecision(4)))
  .catch(console.error)

  cc.generateAvg(Session.get('referenceCurrency'), 'BTC', ['Kraken'])
  .then(data => Session.set('btcChange24h', data.CHANGEPCT24HOUR.toPrecision(4)))
  .catch(console.error)

  cc.generateAvg('MLN', Session.get('referenceCurrency'), ['Kraken'])
  .then(data => Session.set('mlnChange24h', data.CHANGEPCT24HOUR.toPrecision(4)))
  .catch(console.error)

  cc.generateAvg('REP', Session.get('referenceCurrency'), ['Kraken'])
  .then(data => Session.set('repChange24h', data.CHANGEPCT24HOUR.toPrecision(4)))
  .catch(console.error)
});
