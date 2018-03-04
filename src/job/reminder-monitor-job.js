const constants = require('../../config/constants');
const IteratorHelper = require('../lib/iterator-helper');
const BasicHelper = require('../lib/basic-helper');
const SheetApi = require('../utility/google-sheet-api');

function rule(row) {
  const {date, time} = this;
  return (row.time && row.date === date && row.time.startsWith(time)) ? true : false;
}

function stringify(row) {
  return `${row.type}   ${row.title}`;
}

module.exports = {
  _rule: rule,
  _stringify: stringify,
  fetch: async (today, time, options) => {
    try {
      const secrets = require(constants.secretPath(options.fake, 'reminder'));
      const params = {spreadsheetId: secrets.id, range: secrets.range};

      const data = await SheetApi.get(secrets.file, secrets.scope, params);

      const reminderJson = data.map(row => IteratorHelper.toJson(row, secrets.fields));
      const bind = rule.bind({date: today, time});
      let reminders = reminderJson.filter(bind);

      options.log('reminder monitor...');
      reminders = reminders.map(stringify);
      return BasicHelper.displayChat(reminders, constants.reminder.monitorTitle);
    } catch (err) {
      options.log('cant fetch reminder report', err);
    }
    return '';
  }
};
