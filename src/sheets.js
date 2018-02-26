const { promisify } = require('util');
const { google } = require('googleapis');
const notification = require('./parser/tasknotification');
const alert = require('./parser/taskalert');
const auth = require('../lib/auth');
const { _getSecrets } = require('../lib/commonhelper');
const constants = require('../config/constants');

const sheets = google.sheets('v4');
const readSheets = promisify(sheets.spreadsheets.values.get);

module.exports = {
  fetchNotification: async (fake) => {
    try {
      const secrets = require(_getSecrets(constants.secretPath, fake, 'sheets'));

      const options = { spreadsheetId: secrets.id, range: secrets.range };
      const params = await auth(secrets.file, secrets.scope, options);

      const sheetsData = await readSheets(params);
      const data = sheetsData.data.values;

      const link = secrets.link;
      const msg = notification.parse({ data, link });

      return msg || '';
    } catch (err) {
      console.error('cant fetch notification\n', err);
    }
    return '';
  },
  fetchAlert: async (fake) => {
    try {
      const secrets = require(_getSecrets(constants.secretPath, fake, 'sheets'));

      const options = { spreadsheetId: secrets.id, range: secrets.range };
      const params = await auth(secrets.file, secrets.scope, options);

      const sheetsData = await readSheets(params);
      const data = sheetsData.data.values;

      const link = secrets.link;
      const msg = alert.parse({ data, link });

      return msg || '';
    } catch (err) {
      console.error('cant fetch alert\n', err);
    }
    return '';
  }
};
