import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

// Collections
import { Portfolios } from '/imports/api/portfolios';
import { Registrars } from '/imports/api/modules';



import EtherToken from '/imports/lib/assets/contracts/EtherToken.sol.js';
import BitcoinToken from '/imports/lib/assets/contracts/BitcoinToken.sol.js';
import DollarToken from '/imports/lib/assets/contracts/DollarToken.sol.js';
import EuroToken from '/imports/lib/assets/contracts/EuroToken.sol.js';
import PriceFeed from '/imports/lib/assets/contracts/PriceFeed.sol.js';
import Exchange from '/imports/lib/assets/contracts/Exchange.sol.js';
import Registrar from '/imports/lib/assets/contracts/Registrar.sol.js';
import Version from '/imports/lib/assets/contracts/Version.sol.js';
import Meta from '/imports/lib/assets/contracts/Meta.sol.js';

Meteor.startup(() => {
  Session.set('etherTokenContractAddress', EtherToken.all_networks['3'].address);
  Session.set('bitcoinTokenContractAddress', BitcoinToken.all_networks['3'].address);
  Session.set('dollarTokenContractAddress', DollarToken.all_networks['3'].address);
  Session.set('euroTokenContractAddress', EuroToken.all_networks['3'].address);
  Session.set('priceFeedContractAddress', PriceFeed.all_networks['3'].address);
  Session.set('exchangeContractAddress', Exchange.all_networks['3'].address);
  Session.set('registrarContractAddress', Registrar.all_networks['3'].address);
  Session.set('versionContractAddress', Version.all_networks['3'].address);
  Session.set('metaContractAddress', Meta.all_networks['3'].address);

  Meteor.subscribe('portfolios');
  Meteor.subscribe('registrars');

  // Meteor.call('registrars.insert', Session.get('registrarContractAddress'));
  // console.log(Registrars.findOne({}, { sort: { createdAt: -1 } }));
});
