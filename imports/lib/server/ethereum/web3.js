import Web3 from 'web3';

// set the provider you want from Web3.providers
if ((new Web3(new Web3.providers.HttpProvider('http://localhost:8547'))).isConnected()) {
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8547'));
} else {
  web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.melonport.com'));
}

export default web3;
