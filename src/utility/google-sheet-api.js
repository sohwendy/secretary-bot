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

const auth = async({ token: tokenFile, permission: scope }) => {
  try {
    const file = await readFile(tokenFile);
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
  read: async(config, transform) => {
    try {
      const { token, permission, spreadsheetId, range } = config;

      const jwtClient = await auth({ token, permission });
      const params = Object.assign({ auth: jwtClient }, { spreadsheetId, range });
      const result = await sheets.get(params);
      const { values } = result.data;
      return transform(values);
    } catch (e) {
      Logger.log('Google Sheet get failed', e);
    }
    return '';
  },
  write2: async(config, values) => {
    try {
      const { token, permission, spreadsheetId, range } = config;

      const jwtClient = await auth({token, permission});
      const resource = {
        majorDimension: 'ROWS',
        values: [values]
      };

      const result = await sheets.append({
        auth: jwtClient,
        valueInputOption: 'USER_ENTERED',
        spreadsheetId,
        range,
        resource,
      });
      return result.data.updates.updatedCells;
    } catch (e) {
      Logger.log('Google Sheet set failed', e);
    }
    return '';
  }
};
