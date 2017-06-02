const constants = require('./constants.js');
import addressList from '/imports/melon/interface/addressList';

// Tokens

exports.getTokenPrecisionByAddress = (address) => {
  if (address === addressList.etherToken) return constants.ETHERTOKEN_PRECISION;
  if (address === addressList.melonToken) return constants.MELONTOKEN_PRECISION;
  if (address === addressList.bitcoinToken) return constants.BITCOINTOKEN_PRECISION;
  if (address === addressList.euroToken) return constants.EUROTOKEN_PRECISION;
  if (address === addressList.repToken) return constants.REPTOKEN_PRECISION;
  return false;
};

exports.getTokenSymbolByAddress = (address) => {
  if (address === addressList.etherToken) return 'ETH-T';
  if (address === addressList.melonToken) return 'MLN-T';
  if (address === addressList.bitcoinToken) return 'BTC-T';
  if (address === addressList.euroToken) return 'EUR-T';
  if (address === addressList.repToken) return 'REP-T';
  return false;
};

exports.getTokenAddress = (symbol) => {
  if (symbol === 'ETH-T') return addressList.etherToken;
  if (symbol === 'MLN-T') return addressList.melonToken;
  if (symbol === 'BTC-T') return addressList.bitcoinToken;
  if (symbol === 'EUR-T') return addressList.euroToken;
  if (symbol === 'REP-T') return addressList.repToken;
  return false;
};

exports.getQuoteTokens = () => ['ETH-T'];

exports.getBaseTokens = () => ['MLN-T', 'BTC-T', 'EUR-T', 'REP-T'];

exports.getTokens = () => ['ETH-T', 'MLN-T', 'BTC-T', 'EUR-T', 'REP-T'];
