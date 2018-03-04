const axios = require('axios');

function constructUrl(key) {
  return `https://openexchangerates.org/api/latest.json?app_id=${key}`;
}

module.exports = {
  _constructUrl: constructUrl,
  get: async (key, logger) => {
    try {
      const response = await axios.get(constructUrl(key));
      return response.data.rates;
    } catch (e) {
      logger.log('OER Failed', e);
    }
    return '';
  }
};
