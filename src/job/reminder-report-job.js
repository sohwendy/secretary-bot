const constants = require('../../config/constants');
const IteratorHelper = require('../lib/iterator-helper');
const BasicHelper = require('../lib/basic-helper');
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
  fetch: async (dates, options) => {
    try {
      const secrets = require(constants.secretPath(options.fake, 'reminder'));
      const params = {spreadsheetId: secrets.id, range: secrets.range};

      const data = await SheetApi.get(secrets.file, secrets.scope, params);
      const reminderJson = data.map(row => IteratorHelper.toJson(row, secrets.fields));

      const bind = rule.bind(dates);
      let reminders = reminderJson.filter(bind);
      let group = dates.map(date => reminders.filter(r => r.date === date));

      group = group.map((g, index) => {
        const msg = g.map(stringifyReminder).join('\n');
        const date = `${index === 0 ? 'Today,' : ''} ${dates[index].replace(/2018/i, '')}`;
        return {count: g.length, msg, date: date};
      });

      group = group.map(stringify).filter(g => g);

      options.log('reminder report...', dates)
      return BasicHelper.displayChat(group, constants.reminder.reportTitle, secrets.link);
    } catch (err) {
      options.log('cant fetch reminder report', err);
    }
    return '';
  }
};
