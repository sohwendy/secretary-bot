const constants = require('../../config/constants');
const JsonFileHelper = require('../lib/json-file-helper');
const IteratorHelper = require('../lib/iterator-helper');
const Logger = require('../lib/log-helper');
const BasicHelper = require('../lib/basic-helper');
const SheetApi = require('../utility/google-sheet-api');

function rule(row) {
  const { date, time } = this;
  return (row.time && row.date === date && row.time.startsWith(time)) ? true : false;
}

function stringify(row) {
  return `${row.type}   ${row.title}`;
}

module.exports = {
  _rule: rule,
  _stringify: stringify,
  fetch: async(today, time, options) => {
    try {
      Logger.log('get reminder monitor...');

      const forexConst = constants.reminder;
      const secrets = await JsonFileHelper.get(constants.secretPath(options.fake, 'reminder.json'));
      const params = { spreadsheetId: secrets.id, range: forexConst.range };

      const data = await SheetApi.get(forexConst.file, forexConst.scope, params);

      const reminderJson = data.map(row => IteratorHelper.toJson(row, forexConst.fields));
      const bind = rule.bind({ date: today, time });
      let reminders = reminderJson.filter(bind);

      reminders = reminders.map(stringify);
      Logger.log('send reminder monitor...', reminders.length);
      return BasicHelper.displayChat(reminders, forexConst.monitorTitle);
    } catch (err) {
      Logger.log('cant fetch reminder report', err);
    }
    Logger.log('no reminder monitor');
    return '';
  }
};
