import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

// Collections
import { Cores } from '/imports/api/cores';
import { Universes } from '/imports/api/modules';

import AddressList from '/imports/lib/ethereum/address_list.js'
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
  Session.set('etherTokenContractAddress', AddressList.EtherToken);
  Session.set('melonTokenContractAddress', AddressList.MelonToken);
  Session.set('bitcoinTokenContractAddress', AddressList.BitcoinToken);
  Session.set('euroTokenContractAddress', AddressList.EuroToken);
  Session.set('repTokenContractAddress', AddressList.RepToken);
  Session.set('priceFeedContractAddress', AddressList.CryptoCompare);
  Session.set('exchangeContractAddress', AddressList.Exchange);
  Session.set('universeContractAddress', AddressList.Universe);
  Session.set('subscribeContractAddress', AddressList.Subscribe);
  Session.set('redeemContractAddress', AddressList.Redeem);
  Session.set('riskMgmtContractAddress', AddressList.RiskMgmt);
  Session.set('managmentFeeContractAddress', AddressList.ManagementFee);
  Session.set('performanceFeeContractAddress', AddressList.PerformanceFee);
  Session.set('versionContractAddress', AddressList.Version);
  Session.set('governanceContractAddress', AddressList.Governance);

  Meteor.subscribe('cores');
  Meteor.subscribe('universes');
});
