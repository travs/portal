// This defines all the collections, publications and methods that the application provides
// as an API to the client.
import '/imports/startup/server/register-apis';

// Syncs all the collections according to the blockchain state
import '/imports/startup/server/sync-collections';

// Helper Method to determine if server is connected
import '/imports/lib/web3/isServerConnected';
