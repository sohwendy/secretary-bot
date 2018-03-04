const moment = require('moment');

function log(msg, error) {
  const fake = this;
  if (fake == true) return;
  const timestamp = moment().tz('Asia/Singapore').format('DD/MM HH:mm:ss');
  console.log(`[${timestamp}] ${msg} ${error == undefined ? '' : error}`); //eslint-disable-line no-console
}

module.exports = log;
