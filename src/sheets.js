const { promisify } = require('util');
const { google } = require('googleapis');
const parser = require('./parser/spreadsheet');
const auth = require('./auth');
const secrets = require('../secrets/sheets');

const sheets = google.sheets('v4');
const readSheets = promisify(sheets.spreadsheets.values.get);

module.exports = {
  fetch: async () => {
    try {
      const authClient = await auth(secrets.file, secrets.scope);

      const params = {
        auth: authClient,
        spreadsheetId: secrets.id,
        range: secrets.range
      };

      const sheetsData = await readSheets(params);
      const data = sheetsData.data.values;
      const link = secrets.link;
      const msg = parser({ data, link });
      if (msg)
        return msg;
    } catch (err) {
      console.error('cant fetch sheets\n', err);
    }
  }
};
