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

const auth = async(json, scope) => {
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
    return jwtClient;
  }
  catch(e) {
    Logger.log('Google Auth Failed', e);
    throw e;
  }
};

module.exports = {
  _auth: auth,
  read: async(json, scope, options) => {
    try {
      const jwtClient = await auth(json, scope);

      const params = Object.assign({ auth: jwtClient }, options);

      const result = await sheets.get(params);
      return result.data.values;
    } catch (e) {
      Logger.log('Google Sheet get failed', e);
    }
    return '';
  },
  write: async(json, scope, options, values) => {
    try {
      const jwtClient = await auth(json, scope);

      const resource = {
        majorDimension: 'ROWS',
        values: [values]
      };

      const result = await sheets.append({
        auth: jwtClient,
        valueInputOption: 'USER_ENTERED',
        ...options,
        resource,
      });
      return result.data.updates.updatedCells;
    } catch (e) {
      Logger.log('Google Sheet set failed', e);
    }
    return '';
  }
};
