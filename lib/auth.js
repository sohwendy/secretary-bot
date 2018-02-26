const { promisify } = require('util');
const { google } = require('googleapis');
const fs = require('fs');

const readFile = promisify(fs.readFile);

/* istanbul ignore next */
const error = (error) => {
  if (error) {
    console.error('Google Auth error', error);
    return;
  }
};

module.exports = async (json, scope, options) => {
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

    return params;
  } catch(e) {
    console.error('Auth Failed', e);
  }
};
