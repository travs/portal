// Initialize web3 as global object for entire client side
import web3 from '/imports/lib/client/ethereum/web3.js'

// Load global components
import '/imports/ui/components/summary/network_summary.js';
import '/imports/ui/components/summary/executive_summary.js';

import '/imports/ui/client/helpers.js';

import '/imports/startup/client/ethereum-config.js';

import '/imports/startup/client/network.js';

import '/imports/startup/client/routes.js';
