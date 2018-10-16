const axios = require('axios');
const Logger = require('../lib/log-helper');
const { calculateExchangeRate } = require('../lib/basic-helper');

function constructUrl(key) {
  return `https://openexchangerates.org/api/latest.json?app_id=${key}`;
}

function transform(rates) {
  const sgdRate = rates['SGD'];
  const keys = Object.keys(rates);
  return keys.map(key => {
    return {
      code: key,
      price: calculateExchangeRate(rates[key], sgdRate)
    };
  });
}

module.exports = {
  _constructUrl: constructUrl,
  get2: async(config) => {
    try {
      const response = await axios.get(constructUrl(config.key));
      const { rates } = response.data;
      return rates ? transform(rates) : '';
    } catch (e) {
      Logger.log('OER Failed', e);
    }
    return '';
  },
  get: async(key) => {
    try {
      const response = await axios.get(constructUrl(key));
      return response.data.rates;
    } catch (e) {
      Logger.log('OER Failed', e);
    }
    return '';
  }
};
