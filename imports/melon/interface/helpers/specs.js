import addressList from '../addressList';
import constants from './constants.js';

// Tokens

export const getTokenPrecisionByAddress = (address) => {
  if (address === addressList.etherToken) return constants.ETHERTOKEN_PRECISION;
  if (address === addressList.melonToken) return constants.MELONTOKEN_PRECISION;
  if (address === addressList.bitcoinToken) {
    return constants.BITCOINTOKEN_PRECISION;
  }
  if (address === addressList.euroToken) return constants.EUROTOKEN_PRECISION;
  if (address === addressList.repToken) return constants.REPTOKEN_PRECISION;
  return false;
};

export const getTokenSymbolByAddress = (address) => {
  if (address === addressList.etherToken) return 'ETH-T';
  if (address === addressList.melonToken) return 'MLN-T';
  if (address === addressList.bitcoinToken) return 'BTC-T';
  if (address === addressList.euroToken) return 'EUR-T';
  if (address === addressList.repToken) return 'REP-T';
  return false;
};

export const getTokenAddress = (symbol) => {
  if (symbol === 'ETH-T') return addressList.etherToken;
  if (symbol === 'MLN-T') return addressList.melonToken;
  if (symbol === 'BTC-T') return addressList.bitcoinToken;
  if (symbol === 'EUR-T') return addressList.euroToken;
  if (symbol === 'REP-T') return addressList.repToken;
  return false;
};

export const getTokenPrecisionBySymbol = (symbol) => {
  if (symbol === 'ETH-T') return constants.ETHERTOKEN_PRECISION;
  if (symbol === 'MLN-T') return constants.MELONTOKEN_PRECISION;
  if (symbol === 'BTC-T') return constants.BITCOINTOKEN_PRECISION;
  if (symbol === 'EUR-T') return constants.EUROTOKEN_PRECISION;
  if (symbol === 'REP-T') return constants.REPTOKEN_PRECISION;
  return false;
};

export const networkMapping = {
  4: 'Rinkeby',
  3: 'Ropsten',
  42: 'Kovan',
  1: 'Main',
  null: 'Private',
};

export const getQuoteTokens = () => ['ETH-T'];

export const getBaseTokens = () => ['MLN-T', 'BTC-T', 'EUR-T', 'REP-T'];

export const getTokens = () => ['ETH-T', 'MLN-T', 'BTC-T', 'EUR-T', 'REP-T'];
