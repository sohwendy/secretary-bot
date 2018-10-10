const constants = require('../../config/constants');
const JsonFileHelper = require('../lib/json-file-helper');
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
  fetch: async(today, time) => {
    try {
      Logger.log('get reminder monitor...', today, time);

      const reminderConst = constants.reminder;
      const secrets = await JsonFileHelper.read(constants.secretPath('reminder.json'));
      const params = { spreadsheetId: secrets.id, range: reminderConst.task.range };

      const reminderJson = await SheetApi.read(reminderConst.file, reminderConst.scope, params, reminderConst.task.fields);

      const bind = rule.bind({ date: today, time });
      let reminders = reminderJson.filter(bind);

      reminders = reminders.map(stringify);
      Logger.log('send reminder monitor...', reminders.length);
      return BasicHelper.displayChat(reminders, reminderConst.monitorTitle);
    } catch (err) {
      Logger.log('cant fetch reminder report', err);
    }
    Logger.log('no reminder monitor');
    return '';
  }
};
