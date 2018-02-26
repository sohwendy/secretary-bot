const axios = require('axios');
const constants = require('../config/constants');
const forexNotification = require('./parser/ForexNotification');

function _constructUrl(key) {
  return `https://openexchangerates.org/api/latest.json?app_id=${key}`;
}

function _getSecrets(fake) {
  return `${constants.secretPath[ fake ? 'fake' : 'real']}/oer`;
}

module.exports = {
  fetchNotification: async (fake) => {
    try {
      const secrets = require(_getSecrets(fake));

      const response = await axios.get(_constructUrl(secrets.key));
      if (!response) return '';
      const msg = forexNotification.parse({ data: response.data.rates });
      return msg || '';
    } catch (error) {
      console.error('failed to fetch forex', error);
    }
    return '';
  },
  fetchAlert: async (fake) => {
    try {
      // const secrets = require(_getSecrets(fake));
      return fake + 'pending';

    //   const response = await axios.get(_constructUrl(secrets.key));
    //   if (!response) return '';
    //   const msg = forex.parse({ data: response.data.rates });
    //   if (msg) return msg;
    } catch (error) {
      console.error('failed to fetch forex', error);
    }
  }
};

