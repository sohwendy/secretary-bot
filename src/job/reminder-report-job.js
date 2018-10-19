const constants = require('../../config/constants').reminder;
const BasicHelper = require('../lib/basic-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const { arrayToHash2, leftJoin } = require('../lib/iterator-helper');
const Logger = require('../lib/log-helper');
const SheetApi = require('../utility/google-sheet-api');

function stringify(item, index) {
  const group = this;
  const today = index === 0 ? 'Today,' : '';
  const date = item.replace(/2018/i, '');
  return group[index] ? `${today}${date}\n${group[index]}` : '';
}

function stringifyReminder(row) {
  return ` ${row.type}  ${row.title}`;
}

const Worker = {
  init: async(constants) => {
    const secrets = await JsonFileHelper.read(constants.secretFile);
    const transform = arrayToHash2.bind(constants.task.fields);
    const config = {
      title: constants.reportTitle,
      task: {
        token: constants.file,
        permission: constants.permission,
        spreadsheetId: secrets.id,
        range: constants.task.range
      },
      moment: {
        token: constants.file,
        permission: constants.permission,
        spreadsheetId: secrets.id,
        range: constants.moment.range
      }
    };
    return { config, transform };
  },
  execute: async(settings, dates) => {
    // get task and moment list
    let data = await Promise.all([
      SheetApi.read(settings.config.task, settings.transform),
      SheetApi.read(settings.config.moment, settings.transform)
    ]);

    // extract relevant events
    const dateHash = dates.map(date => { return { date }; });
    data = data.map(d => leftJoin(d, dateHash, 'date'));
    const array = data[0].concat(data[1]);

    // grouping according to date
    let group = dateHash.map(date => leftJoin(array, [date], 'date'));

    // format
    group = group.map(g => g.map(stringifyReminder).join('\n'));
    return dates.map(stringify, group);
  }
};

module.exports = {
  _stringify: stringify,
  _stringifyReminder: stringifyReminder,
  fetch: async(dates) => {
    try {
      Logger.log('get reminder report...', dates);

      const settings = await Worker.init(constants);
      const list = await Worker.execute(settings, dates);

      Logger.log('send reminder report...', list.length);
      return BasicHelper.displayChat(list, settings.config.title);
    } catch (err) {
      Logger.log('cant fetch reminder report', err);
    }
    Logger.log('no reminder report');
    return '';
  },
  Worker
};
