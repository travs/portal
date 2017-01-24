import { _ } from 'meteor/underscore';

import EtherToken from '/imports/lib/assets/contracts/EtherToken.sol.js';
import BitcoinToken from '/imports/lib/assets/contracts/BitcoinToken.sol.js';
import RepToken from '/imports/lib/assets/contracts/RepToken.sol.js';
import EuroToken from '/imports/lib/assets/contracts/EuroToken.sol.js';

const tokens = {
  ropsten: {
    'ETH-T': EtherToken.all_networks['3'].address,
    'BTC-T': BitcoinToken.all_networks['3'].address,
    REP: RepToken.all_networks['3'].address,
    'EUR-T': EuroToken.all_networks['3'].address,
  },
};

// http://numeraljs.com/ for formats
const tokenSpecs = {
  'ETH-T': { precision: 18, format: '0,0.00[0000000000000000]' },
  'BTC-T': { precision: 8, format: '0,0.00[000000]' },
  REP: { precision: 8, format: '0,0.00[000000]' },
  'EUR-T': { precision: 8, format: '0,0.00[000000]' },
};

export { tokens, tokenSpecs };

exports.getQuoteTokens = () => ['ETH-T'];

exports.getBaseTokens = () => ['BTC-T', 'REP', 'EUR-T'];

exports.getTokens = () => ['ETH-T', 'BTC-T', 'REP', 'EUR-T'];

exports.getTokenAddress = symbol => tokens.ropsten[symbol];

exports.getTokenByAddress = address => _.invert(tokens.ropsten)[address];
