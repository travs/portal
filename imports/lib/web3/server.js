import { Meteor } from 'meteor/meteor';
import Web3 from 'web3';

const localNode = 'http://localhost:8547';
const kovanNode = 'https://kovan.melonport.com';

export default (() => {
  if (Meteor.isClient) return null;

  if (new Web3(new Web3.providers.HttpProvider(localNode)).isConnected()) {
    return new Web3(new Web3.providers.HttpProvider(localNode));
  } else if (new Web3(new Web3.providers.HttpProvider(kovanNode)).isConnected()) {
    return new Web3(new Web3.providers.HttpProvider(kovanNode));
  }

  throw new Meteor.Error(
    'No server-side web3 provider',
    'Neither local instance nor node rpc connected',
  );
})();
