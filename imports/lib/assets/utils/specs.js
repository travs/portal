import EtherToken from '/imports/lib/assets/contracts/EtherToken.json';
import BitcoinToken from '/imports/lib/assets/contracts/BitcoinToken.json';
import RepToken from '/imports/lib/assets/contracts/RepToken.json';
import EuroToken from '/imports/lib/assets/contracts/EuroToken.json';

const constants = require('./constants.js');

// Tokens

exports.getTokenPrecisionByAddress = (address) => {
  if (address === EtherToken.all_networks['3'].address) return constants.ETHERTOKEN_PRECISION;
  if (address === BitcoinToken.all_networks['3'].address) return constants.BITCOINTOKEN_PRECISION;
  if (address === RepToken.all_networks['3'].address) return constants.REPTOKEN_PRECISION;
  if (address === EuroToken.all_networks['3'].address) return constants.EUROTOKEN_PRECISION;
  return false;
};

exports.getTokenSymbolByAddress = (address) => {
  if (address === EtherToken.all_networks['3'].address) return 'ETH-T';
  if (address === BitcoinToken.all_networks['3'].address) return 'BTC-T';
  if (address === RepToken.all_networks['3'].address) return 'REP';
  if (address === EuroToken.all_networks['3'].address) return 'EUR-T';
  return false;
};

exports.getTokenAddress = (symbol) => {
  if (symbol === 'ETH-T') return EtherToken.all_networks['3'].address;
  if (symbol === 'BTC-T') return BitcoinToken.all_networks['3'].address;
  if (symbol === 'REP') return RepToken.all_networks['3'].address;
  if (symbol === 'EUR-T') return EuroToken.all_networks['3'].address;
  return false;
};

exports.getQuoteTokens = () => ['ETH-T'];

exports.getBaseTokens = () => ['BTC-T', 'REP', 'EUR-T'];

exports.getTokens = () => ['ETH-T', 'BTC-T', 'REP', 'EUR-T'];
