const constants = require('../../config/constants');
const BasicHelper = require('../lib/basic-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const IteratorHelper = require('../lib/iterator-helper');
const Logger = require('../lib/log-helper');
const SheetApi = require('../utility/google-sheet-api');

function rule(row) {
  const dates = this;
  return dates.includes(row.date);
}

function stringify(row) {
  return row.count === 0 ? '' : `${row.count}) ${row.date}\n${row.msg}`;
}

function stringifyReminder(row) {
  return `${row.type}   ${row.title}`;
}

module.exports = {
  _rule: rule,
  _stringify: stringify,
  _stringifyReminder: stringifyReminder,
  fetch: async(dates, options) => {
    try {
      Logger.log('get reminder report...');
      const reminderConst = constants.reminder;
      const secrets = await JsonFileHelper.get(constants.secretPath(options.fake, 'reminder.json'));
      const params = { spreadsheetId: secrets.id, range: reminderConst.range };

      const data = await SheetApi.get(reminderConst.file, reminderConst.scope, params);
      const reminderJson = data.map(row => IteratorHelper.toJson(row, reminderConst.fields));

      const bind = rule.bind(dates);
      let reminders = reminderJson.filter(bind);
      let group = dates.map(date => reminders.filter(r => r.date === date));

      group = group.map((g, index) => {
        const msg = g.map(stringifyReminder).join('\n');
        const date = `${index === 0 ? 'Today,' : ''} ${dates[index].replace(/2018/i, '')}`;
        return { count: g.length, msg, date: date };
      });

      group = group.map(stringify).filter(g => g);
      Logger.log('send reminder report...', group.length);
      return BasicHelper.displayChat(group, reminderConst.reportTitle, secrets.link);
    } catch (err) {
      Logger.log('cant fetch reminder report', err);
    }
    Logger.log('no reminder report');
    return '';
  }
};
