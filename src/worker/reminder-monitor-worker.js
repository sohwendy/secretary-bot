const JsonFileHelper = require('../lib/json-file-helper');
const { arrayToHash } = require('../lib/iterator-helper');
const SheetApi = require('../utility/google-sheet-api');

function _stringify(row) {
  return `${row.type}   ${row.title}`;
}

function _rule(row, datetime) {
  const { date, time } = datetime;
  return (row.time && row.date === date && row.time.startsWith(time)) ? true : false;
}

module.exports = {
  _stringify,
  _rule,
  name: 'reminder monitor',
  init: async(constants) => {
    const secrets = await JsonFileHelper.read(constants.secretFile);
    const transform = arrayToHash.bind(constants.fields);
    const config = {
      title: constants.monitorTitle,
      task: {
        token: constants.file,
        permission: constants.permission,
        spreadsheetId: secrets.id,
        range: constants.task.range
      },
    };
    return { config, transform };
  },
  execute: async(settings, datetime) => {
    const { task: codeConfig} = settings.config;
    let list = await SheetApi.read(codeConfig, settings.transform);
    list = list.filter(row => _rule(row, datetime)).map(_stringify);
    return list ;
  }
};
