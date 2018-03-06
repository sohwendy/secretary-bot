/* istanbul ignore file */
const moment = require('moment');

global.debug = false;

function log(msg, error) {
  if (!debug) return;
  const timestamp = moment().tz('Asia/Singapore').format('DD/MM HH:mm:ss');
  console.log(`[${timestamp}] ${msg} ${error == undefined ? '' : error}`); //eslint-disable-line no-console
}

module.exports.log = log;
