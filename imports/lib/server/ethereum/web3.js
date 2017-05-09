import { Meteor } from 'meteor/meteor';
import Web3 from 'web3';

// set the provider you want from Web3.providers
if ((new Web3(new Web3.providers.HttpProvider('http://localhost:8547'))).isConnected()) {
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8547'));
} else if ((new Web3(new Web3.providers.HttpProvider('https://kovan2.melonport.com'))).isConnected()) {
  web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.melonport.com'));
} else {
  throw new Meteor.Error('No server-side web3 provider', 'Neither local instance nor node rpc connected');
}

export default web3;
