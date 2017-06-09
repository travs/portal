import ExchangeJson from '@melonproject/protocol/build/contracts/Exchange.json';
import UniverseJson from '@melonproject/protocol/build/contracts/Universe.json';
import SubscribeJson from '@melonproject/protocol/build/contracts/Subscribe.json';
import RedeemJson from '@melonproject/protocol/build/contracts/Redeem.json';
import RiskMgmtV1Json from '@melonproject/protocol/build/contracts/RiskMgmtV1.json';
import ManagementFeeJson from '@melonproject/protocol/build/contracts/ManagementFee.json';
import PerformanceFeeJson from '@melonproject/protocol/build/contracts/PerformanceFee.json';
import GovernanceJson from '@melonproject/protocol/build/contracts/Governance.json';
import VersionJson from '@melonproject/protocol/build/contracts/Version.json';


const KOVAN_NETWORK_ID = 42;

// Assets

// TODO Addresses are curr case sensitive!
exports.etherToken = '0x7506c7bfed179254265d443856ef9bda19221cd7';
exports.melonToken = '0x4dffea52b0b4b48c71385ae25de41ce6ad0dd5a7';
exports.bitcoinToken = '0x9e4c56a633dd64a2662bdfa69de4fde33ce01bdd';
exports.euroToken = '0xc151b622fded233111155ec273bfaf2882f13703';
exports.repToken = '0xf61b8003637e5d5dbb9ca8d799ab54e5082cbdbc';

// Price Feeds

exports.cryptoCompare = '0x442Fd95C32162F914364C5fEFf27A0Dc05214706';

// Exchanges

exports.exchange = ExchangeJson.networks[KOVAN_NETWORK_ID].address;

// Universe

exports.universe = UniverseJson.networks[KOVAN_NETWORK_ID].address;

// Participation

exports.subscribe = SubscribeJson.networks[KOVAN_NETWORK_ID].address;
exports.redeem = RedeemJson.networks[KOVAN_NETWORK_ID].address;

// Risk Mgmt

exports.riskMgmt = RiskMgmtV1Json.networks[KOVAN_NETWORK_ID].address;

// Fees

exports.managementFee = ManagementFeeJson.networks[KOVAN_NETWORK_ID].address;
exports.performanceFee = PerformanceFeeJson.networks[KOVAN_NETWORK_ID].address;

// Governance

exports.governance = GovernanceJson.networks[KOVAN_NETWORK_ID].address;
exports.version = VersionJson.networks[KOVAN_NETWORK_ID].address;

// Liquidity Provider

exports.liquidityProvider = '0x00e0b33cdb3af8b55cd8467d6d13bc0ba8035acf';
