const moment = require('moment');

function log(msg, error) {
  const fake = this;
  if (fake) return;

  const timestamp = moment().format('DD-MM HH:mm:ss');
  console.log(`[${timestamp}], ${msg} ${error ? error : ''}`); //eslint-disable-line no-console
}

module.exports = log;
