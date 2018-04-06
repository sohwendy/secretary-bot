const { promisify } = require('util');
const { google } = require('googleapis');
const fs = require('fs');
const Logger = require('../lib/log-helper');

const readFile = promisify(fs.readFile);
const sheets = google.sheets('v4').spreadsheets.values;

/* istanbul ignore next */
const error = (error) => {
  if (error) {
    Logger.log('Google Auth error', error);
    return;
  }
};

module.exports = {
  get: async(json, scope, options) => {
    try {
      const file = await readFile(json);
      const secrets = JSON.parse(file);

      const jwtClient = new google.auth.JWT(
        secrets.client_email,
        null,
        secrets.private_key,
        scope,
        null
      );

      await jwtClient.authorize(error);

      const params = Object.assign({ auth: jwtClient }, options);

      const result = await sheets.get(params);
      return result.data.values;
    } catch (e) {
      Logger.log('Google Sheet Failed', e);
    }
    return '';
  }
};
