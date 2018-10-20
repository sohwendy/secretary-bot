const constants = require('../../config/constants').reminder;
const JsonFileHelper = require('../lib/json-file-helper');
const Logger = require('../lib/log-helper');
const { arrayToHash } = require('../lib/iterator-helper');
const BasicHelper = require('../lib/basic-helper');
const SheetApi = require('../utility/google-sheet-api');

function rule(row) {
  const { date, time } = this;
  return (row.time && row.date === date && row.time.startsWith(time)) ? true : false;
}

function stringify(row) {
  return `${row.type}   ${row.title}`;
}

const Worker = {
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
  execute: async(settings, bind) => {
    const { task: codeConfig} = settings.config;
    let list = await SheetApi.read(codeConfig, settings.transform);
    list = list.filter(bind).map(stringify);

    return list ;
  }
};

module.exports = {
  _rule: rule,
  _stringify: stringify,
  fetch: async(today, time) => {
    try {
      Logger.log('get reminder monitor...', today, time);

      const settings = await Worker.init(constants);
      const bind = rule.bind({ date: today, time });

      const list = await Worker.execute(settings, bind);

      Logger.log('send reminder monitor...', list.length);
      return BasicHelper.displayChat(list, settings.config.title);
    } catch (err) {
      Logger.log('cant fetch reminder report', err);
    }
    Logger.log('no reminder monitor');
    return '';
  },
  Worker
};
