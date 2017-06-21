import BigNumber from 'bignumber.js';

const matchedOrders = [
  {
    _id: '9omLP8c3uu38NYhW6',
    id: 1,
    owner: '0x00e0b33cdb3af8b55cd8467d6d13bc0ba8035acf',
    isActive: true,
    buy: {
      symbol: 'ETH-T',
      howMuch: new BigNumber('0.3'),
    },
    sell: {
      symbol: 'MLN-T',
      howMuch: new BigNumber('1'),
    },
  },
  {
    _id: 'XD2jNumheT5wwfqfx',
    id: 2,
    owner: '0x00e0b33cdb3af8b55cd8467d6d13bc0ba8035acf',
    isActive: true,
    buy: {
      symbol: 'ETH-T',
      howMuch: new BigNumber('0.4'),
    },
    sell: {
      symbol: 'MLN-T',
      howMuch: new BigNumber('1'),
    },
  },
];

export default matchedOrders;
