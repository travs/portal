const constants = require('./constants.js');
import AddressList from '/imports/melon/interface/addressList.js';

// Tokens

exports.getTokenPrecisionByAddress = (address) => {
  if (address === AddressList.EtherToken) return constants.ETHERTOKEN_PRECISION;
  if (address === AddressList.MelonToken) return constants.MELONTOKEN_PRECISION;
  if (address === AddressList.BitcoinToken) return constants.BITCOINTOKEN_PRECISION;
  if (address === AddressList.EuroToken) return constants.EUROTOKEN_PRECISION;
  if (address === AddressList.RepToken) return constants.REPTOKEN_PRECISION;
  return false;
};

exports.getTokenSymbolByAddress = (address) => {
  if (address === AddressList.EtherToken) return 'ETH-T';
  if (address === AddressList.MelonToken) return 'MLN-T';
  if (address === AddressList.BitcoinToken) return 'BTC-T';
  if (address === AddressList.EuroToken) return 'EUR-T';
  if (address === AddressList.RepToken) return 'REP-T';
  return false;
};

exports.getTokenAddress = (symbol) => {
  if (symbol === 'ETH-T') return AddressList.EtherToken;
  if (symbol === 'MLN-T') return AddressList.MelonToken;
  if (symbol === 'BTC-T') return AddressList.BitcoinToken;
  if (symbol === 'EUR-T') return AddressList.EuroToken;
  if (symbol === 'REP-T') return AddressList.RepToken;
  return false;
};

exports.getQuoteTokens = () => ['ETH-T'];

exports.getBaseTokens = () => ['MLN-T', 'BTC-T', 'EUR-T', 'REP-T'];

exports.getTokens = () => ['ETH-T', 'MLN-T', 'BTC-T', 'EUR-T', 'REP-T'];
