import { Meteor } from 'meteor/meteor';
import Web3 from 'web3';

const localNode = 'http://localhost:8547';
const kovanNode = 'https://kovan.melonport.com';

// set the provider you want from Web3.providers
if ((new Web3(new Web3.providers.HttpProvider(localNode))).isConnected()) {
  web3 = new Web3(new Web3.providers.HttpProvider(localNode));
} else if ((new Web3(new Web3.providers.HttpProvider(kovanNode))).isConnected()) {
  web3 = new Web3(new Web3.providers.HttpProvider(kovanNode));
} else {
  throw new Meteor.Error('No server-side web3 provider', 'Neither local instance nor node rpc connected');
}

export default web3;
