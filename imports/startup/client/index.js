// Initialize web3 as global object for entire client side
import web3 from '/imports/lib/client/ethereum/web3';

// Load global components
import '/imports/ui/components/ux/ux_pages';
import '/imports/ui/components/summary/summary_melon';
import '/imports/ui/components/summary/summary_executive';

import '/imports/ui/client/helpers';

import '/imports/startup/client/routes';
import '/imports/startup/client/config';
import '/imports/startup/client/network';
import '/imports/startup/client/store';
import '/imports/startup/client/sync-session';

window.web3 = web3;
