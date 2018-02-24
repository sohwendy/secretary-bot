const { promisify } = require('util');
const { google } = require('googleapis');
const fs = require('fs');

const readFile = promisify(fs.readFile);

const error = (error) => {
  if (error) {
    console.error('Google Auth error', error);
    return;
  }
};

module.exports = async (json, scope) => {
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
  } catch(e) {
    console.error('Auth Failed', e);
  }
};
