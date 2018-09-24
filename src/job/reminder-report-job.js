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
  return ` ${row.type}  ${row.title}`;
}

module.exports = {
  _rule: rule,
  _stringify: stringify,
  _stringifyReminder: stringifyReminder,
  fetch: async(dates) => {
    try {
      Logger.log('get reminder report...', dates);
      const bind = rule.bind(dates);
      const reminderConst = constants.reminder;
      const secrets = await JsonFileHelper.get(constants.secretPath('reminder.json'));

      const configConstant = [reminderConst.task, reminderConst.moment];

      const taskOptions = { spreadsheetId: secrets.id, range: configConstant[0].range };
      const momentOptions = { spreadsheetId: secrets.id, range: configConstant[1].range };

      // get task and moment list
      let data = await Promise.all([
        SheetApi.get(reminderConst.file, reminderConst.scope, taskOptions),
        SheetApi.get(reminderConst.file, reminderConst.scope, momentOptions)
      ]);

      let reminders = [];
      for (let i = 0; i < 2; i++) {
        data[i] = data[i].map(row => IteratorHelper.toJson(row, configConstant[i].fields));
        reminders = reminders.concat(data[i].filter(bind));
      }

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
