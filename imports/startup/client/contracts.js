import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

// Collections
import { Cores } from '/imports/api/cores';
import { Universes } from '/imports/api/modules';

import EtherToken from '/imports/lib/assets/contracts/EtherToken.json';
import BitcoinToken from '/imports/lib/assets/contracts/BitcoinToken.json';
import RepToken from '/imports/lib/assets/contracts/RepToken.json';
import EuroToken from '/imports/lib/assets/contracts/EuroToken.json';
import PriceFeed from '/imports/lib/assets/contracts/PriceFeed.json';
import Exchange from '/imports/lib/assets/contracts/Exchange.json';
import Universe from '/imports/lib/assets/contracts/Universe.json';
import Version from '/imports/lib/assets/contracts/Version.json';
import Governance from '/imports/lib/assets/contracts/Governance.json';

Meteor.startup(() => {
  Session.set('etherTokenContractAddress', EtherToken.all_networks['3'].address);
  Session.set('bitcoinTokenContractAddress', BitcoinToken.all_networks['3'].address);
  Session.set('repTokenContractAddress', RepToken.all_networks['3'].address);
  Session.set('euroTokenContractAddress', EuroToken.all_networks['3'].address);
  Session.set('priceFeedContractAddress', PriceFeed.all_networks['3'].address);
  Session.set('exchangeContractAddress', Exchange.all_networks['3'].address);
  Session.set('universeContractAddress', Universe.all_networks['3'].address);
  Session.set('versionContractAddress', Version.all_networks['3'].address);
  Session.set('governanceContractAddress', Governance.all_networks['3'].address);

  Meteor.subscribe('cores');
  Meteor.subscribe('universes');
});
