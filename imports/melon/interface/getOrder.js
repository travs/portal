import contract from 'truffle-contract';

import web3 from '/imports/lib/web3';
import addressList from './addressList';
import ExchangeJson from '../contracts/Exchange.json';
import { getTokenPrecisionByAddress, getTokenSymbolByAddress } from './helpers/specs';


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
    const sellPrice = buyHowMuch / (sellHowMuch * Math.pow(10, sellPrecision - buyPrecision));
    const buyPrice = sellHowMuch / (buyHowMuch * Math.pow(10, buyPrecision - sellPrecision));

    return {
      id,
      owner,
      isActive,
      buy: {
        token: buyWhichToken,
        symbol: buySymbol,
        howMuch: buyHowMuch.toNumber(),
        howMuchPrecise: buyHowMuch.toString(),
        precision: buyPrecision,
        price: buyPrice,
      },
      sell: {
        token: sellWhichToken,
        symbol: sellSymbol,
        howMuch: sellHowMuch.toNumber(),
        howMuchPrecise: sellHowMuch.toString(),
        precision: sellPrecision,
        price: sellPrice,
      },
      timestamp,
    };
  });
};


export default getOrder;
