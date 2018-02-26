const axios = require('axios');
const constants = require('../config/constants');
const forex = require('./parser/forex');

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
      const msg = forex.parse({ data: response.data.rates });
      if (msg) return msg;
    } catch (error) {
      console.error('failed to fetch forex', error);
    }
  },
  fetchAlert: async (fake) => {
    try {
      const secrets = require(_getSecrets(fake));
      return 'pending';

    //   const response = await axios.get(_constructUrl(secrets.key));
    //   if (!response) return '';
    //   const msg = forex.parse({ data: response.data.rates });
    //   if (msg) return msg;
    } catch (error) {
      console.error('failed to fetch forex', error);
    }
  }
};

