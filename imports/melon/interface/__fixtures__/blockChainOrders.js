import BigNumber from 'bignumber.js';

const orders = [
  {
    id: 6870,
    data: [
      new BigNumber('855505176'),
      '0xf61b8003637e5d5dbb9ca8d799ab54e5082cbdbc',
      new BigNumber('1000000000000000000'),
      '0x7506c7bfed179254265d443856ef9bda19221cd7',
      123,
      '0x00e0b33cdb3af8b55cd8467d6d13bc0ba8035acf',
      true,
    ],
  },
  {
    id: 1,
    data: [
      new BigNumber(1 * Math.pow(10, 18)),
      '0x4dffea52b0b4b48c71385ae25de41ce6ad0dd5a7',
      new BigNumber(0.3 * Math.pow(10, 18)),
      '0x7506c7bfed179254265d443856ef9bda19221cd7',
      123,
      '0x00e0b33cdb3af8b55cd8467d6d13bc0ba8035acf',
      true,
    ],
  },
  {
    id: 2,
    data: [
      new BigNumber(1 * Math.pow(10, 18)),
      '0x4dffea52b0b4b48c71385ae25de41ce6ad0dd5a7',
      new BigNumber(0.4 * Math.pow(10, 18)),
      '0x7506c7bfed179254265d443856ef9bda19221cd7',
      123,
      '0x00e0b33cdb3af8b55cd8467d6d13bc0ba8035acf',
      true,
    ],
  },
];

export default orders;
