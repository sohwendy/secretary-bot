const { promisify } = require('util');
const { google } = require('googleapis');
const fs = require('fs');

const readFile = promisify(fs.readFile);
const sheets = google.sheets('v4');
const readSheets = promisify(sheets.spreadsheets.values.get);

/* istanbul ignore next */
const error = (error) => {
  if (error) {
    console.error('Google Auth error', error);
    return;
  }
};

module.exports = {
  get: async(json, scope, options, logger) => {
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

      const result = await readSheets(params);
      return result.data.values;
    } catch (e) {
      logger('Google Sheet Failed', e);
    }
    return '';
  }
};
