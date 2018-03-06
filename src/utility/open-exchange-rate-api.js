const axios = require('axios');
const Logger = require('../lib/log-helper');

function constructUrl(key) {
  return `https://openexchangerates.org/api/latest.json?app_id=${key}`;
}

module.exports = {
  _constructUrl: constructUrl,
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
