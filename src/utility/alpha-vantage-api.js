const axios = require('axios');
const Logger = require('../lib/log-helper');

function constructUrl(key, ticker) {
  return `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${key}`;
}

function transform(json) {
  const content = JSON.parse(json)['Global Quote'];
  return {
    code: content['01. symbol'],
    price: content['05. price'],
    changeAmount: content['09. change']
  };
}

module.exports = {
  _constructUrl: constructUrl,
  _transform: transform,
  get: async(key, ticker, sleep) => {
    try {
      await new Promise(resolve => setTimeout(resolve, sleep));
      const response = await axios.get(constructUrl(key, ticker), { transformResponse: transform });
      return response.data;
    } catch (e) {
      Logger.log('Alpha Vantage Failed', ticker, e);
    }
    return '';
  }
};
