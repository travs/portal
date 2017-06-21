import contract from 'truffle-contract';
import ExchangeJson from '@melonproject/protocol/build/contracts/Exchange.json';

import web3 from '/imports/lib/web3';
import addressList from './addressList';
import { getTokenPrecisionByAddress, getTokenSymbolByAddress } from './helpers/specs';

/*
  @ returns the order with volume as a big number with precision
*/
const getOrder = (id) => {
  const Exchange = contract(ExchangeJson);
  Exchange.setProvider(web3.currentProvider);
  const exchangeContract = Exchange.at(addressList.exchange); // Initialize contract instance

  return exchangeContract.orders(id).then((order) => {
    const [sellHowMuch,
      sellWhichToken,
      buyHowMuch,
      buyWhichToken,
      timestamp,
      owner,
      isActive,
    ] = order;
    const buyPrecision = getTokenPrecisionByAddress(buyWhichToken);
    const sellPrecision = getTokenPrecisionByAddress(sellWhichToken);
    const buySymbol = getTokenSymbolByAddress(buyWhichToken);
    const sellSymbol = getTokenSymbolByAddress(sellWhichToken);

    return {
      id,
      owner,
      isActive,
      buy: {
        token: buyWhichToken,
        symbol: buySymbol,
        howMuch: buyHowMuch.div(Math.pow(10, buyPrecision)),
      },
      sell: {
        token: sellWhichToken,
        symbol: sellSymbol,
        howMuch: sellHowMuch.div(Math.pow(10, sellPrecision)),
      },
      timestamp,
    };
  });
};


export default getOrder;
