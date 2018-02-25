const { promisify } = require('util');
const { google } = require('googleapis');
const notification = require('./parser/notification');
const alert = require('./parser/alert');
const auth = require('./auth');
const constants = require('../config/constants');

const sheets = google.sheets('v4');
const readSheets = promisify(sheets.spreadsheets.values.get);

function _getSecrets(fake) {
  return `${constants.secretPath[ fake ? 'fake' : 'real']}/sheets`;
}

module.exports = {
  _getSecrets: _getSecrets,
  fetchNotification: async (fake) => {
    try {
      const secrets = require(_getSecrets(fake));
      const authClient = await auth(secrets.file, secrets.scope);

      const params = {
        auth: authClient,
        spreadsheetId: secrets.id,
        range: secrets.range
      };

      const sheetsData = await readSheets(params);
      const data = sheetsData.data.values;
      const link = secrets.link;
      const msg = notification.parse({ data, link });
      if (msg)
        return msg;
    } catch (err) {
      console.error('cant fetch notification\n', err);
    }
  },
  fetchAlert: async (fake) => {
    try {
      const secrets = require(_getSecrets(fake));
      const authClient = await auth(secrets.file, secrets.scope);

      const params = {
        auth: authClient,
        spreadsheetId: secrets.id,
        range: secrets.range
      };

      const sheetsData = await readSheets(params);
      const data = sheetsData.data.values;
      const link = secrets.link;
      const msg = alert.parse({ data, link });
      if (msg)
        return msg;
    } catch (err) {
      console.error('cant fetch alert\n', err);
    }
  }
};
