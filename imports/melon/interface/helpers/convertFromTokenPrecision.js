const convertFromTokenPrecision = (value, precision, targetPrecision = 4) => {
  const divisor = Math.pow(10, precision);
  return (value / divisor).toFixed(targetPrecision);
};

export default convertFromTokenPrecision;
