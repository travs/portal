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
  Session.set('etherTokenContractAddress', '0xc5f550c78db2ee33e5867c432e175cac89073772');
  Session.set('melonTokenContractAddress', '0xfcf98c25129ba729e1822e56ffbd3e758b81ce7c');
  Session.set('bitcoinTokenContractAddress', '0x23bb1f93c168a290f0626ec9b9fd8ba8c8591752');
  Session.set('repTokenContractAddress', '0x02a2656ad55e07c3bc7b5d388e80d5a675b28a20');
  Session.set('euroTokenContractAddress', '0x605832d1f474cafc26951287ec47d5c09334f1ce');
  // TODO oraclize address
  Session.set('priceFeedContractAddress', '0x0');
  Session.set('exchangeContractAddress', '0x50396a51a81b938ccb2d1466de9eebc49d5564f5');
  Session.set('universeContractAddress', '0x0');
  Session.set('versionContractAddress', '0x0');
  Session.set('governanceContractAddress', '0x0');

  Meteor.subscribe('cores');
  Meteor.subscribe('universes');
});
