import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';


Meteor.startup(() => {
  Session.set('NetworkStatus', {
    isInactive: true,
    isMining: false,
    isError: false,
    isMined: false,
  });

  // Set 24h Change
  // TODO change is relative to Dollar!
  // TODO check and handle statusCode
  HTTP.get('https://api.coinmarketcap.com/v1/ticker/ethereum/', (error, result) => {
    if (!error) Session.set('ethChange24h', result.data[0].percent_change_24h);
  });
  HTTP.get('https://api.coinmarketcap.com/v1/ticker/bitcoin/', (error, result) => {
    if (!error) Session.set('btcChange24h', result.data[0].percent_change_24h);
  });
  HTTP.get('https://api.coinmarketcap.com/v1/ticker/augur/', (error, result) => {
    if (!error) Session.set('repChange24h', result.data[0].percent_change_24h);
  });
  Session.set('eurChange24h', '0');
});
