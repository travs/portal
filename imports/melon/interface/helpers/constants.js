import BigNumber from 'bignumber.js';

// Tokens

// Constants as defined in the token contracts
exports.PREMINED_AMOUNT = new BigNumber(Math.pow(10, 18));
exports.ETHERTOKEN_PRECISION = 18;
exports.MELONTOKEN_PRECISION = 18;
exports.BITCOINTOKEN_PRECISION = 8;
exports.REPTOKEN_PRECISION = 8; // TODO RepToken has 18 precison! Change at next deployment
exports.EUROTOKEN_PRECISION = 8;

// Price Feed

// Exchange

// Solidity constants
exports.ether = new BigNumber(Math.pow(10, 18));
