// Initialize web3 as global object for entire client side
import web3 from '/imports/lib/client/ethereum/web3.js'

// Load global components
import '/imports/ui/components/ux/ux_index_banner.js';
import '/imports/ui/components/ux/ux_server_connection.js';
import '/imports/ui/components/summary/summary_melon.js';
import '/imports/ui/components/summary/summary_executive.js';

import '/imports/ui/client/helpers.js';

import '/imports/startup/client/routes.js';
import '/imports/startup/client/ethereum-config.js';
import '/imports/startup/client/contracts.js';
import '/imports/startup/client/ux.js';
import '/imports/startup/client/network.js';
