const axios = require('axios');
const { promisify } = require('util');
const constants = require('../config/constants');
const { google } = require('googleapis');
const auth = require('../lib/auth');
const { _getSecrets } = require('../lib/commonhelper');
const forexNotification = require('./parser/forexnotification');
const forexAlert = require('./parser/forexalert');

const sheets = google.sheets('v4');
const readSheets = promisify(sheets.spreadsheets.values.get);

function _constructUrl(key) {
  return `https://openexchangerates.org/api/latest.json?app_id=${key}`;
}

module.exports = {
  fetchNotification: async (fake) => {
    try {
      const secrets = require(_getSecrets(constants.secretPath, fake, 'oer'));

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
      const secretsSheets = require(_getSecrets(constants.secretPath, fake, 'forex'));
      const secretsForex = require(_getSecrets(constants.secretPath, fake, 'oer'));

      const options = { spreadsheetId: secretsSheets.id, range: secretsSheets.range };
      const params = await auth(secretsSheets.file, secretsSheets.scope, options);
      const sheets = readSheets(params);
      const currency = axios.get(_constructUrl(secretsForex.key));

      const msg = axios
        .all([sheets, currency])
        .then(response => {
          const msg = forexAlert.parse({ data: response[1].data.rates, alert: response[0].data.values });
          return msg;
        });

      if (msg) return msg;
    } catch (error) {
      console.error('failed to fetch forex', error);
    }
  }
};

