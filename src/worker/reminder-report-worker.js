const JsonFileHelper = require('../lib/json-file-helper');
const { arrayToHash, leftJoin } = require('../lib/iterator-helper');
const SheetApi = require('../utility/google-sheet-api');

function _stringify(item, index) {
  const group = this;
  const today = index === 0 ? 'Today,' : '';
  const date = item.replace(/2018/i, '');
  return group[index] ? `${today}${date}\n${group[index]}` : '';
}

function _stringifyReminder(row) {
  return ` ${row.type}  ${row.title}`;
}

module.exports = {
  _stringify,
  _stringifyReminder,
  name: 'reminder reporter',
  init: async(constants) => {
    const secrets = await JsonFileHelper.read(constants.secretFile);
    const transform = arrayToHash.bind(constants.task.fields);
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
    group = group.map(g => g.map(_stringifyReminder).join('\n'));
    return dates.map(_stringify, group);
  }
};
