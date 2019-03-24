const JsonFileHelper = require('../lib/json-file-helper');
const { arrayToHash } = require('../lib/iterator-helper');
const SheetApi = require('../utility/google-sheet-api');

function _stringify(row) {
  return row.content;
}

function _findIndex(day, count) {

  const total = ( count && count[0].total) || 1;
  const index = ( day % total ) + 1;
  return index;
}

module.exports = {
  _stringify,
  _findIndex,
  name: 'learn reporter',
  init: async(constants) => {
    const secrets = await JsonFileHelper.read(constants.secretFile);
    const transformCode = arrayToHash.bind(constants.code.fields);
    const transformRules = arrayToHash.bind(constants.rules.fields);
    const config = {
      title: constants.title,
      code: {
        token: constants.file,
        permission: constants.permission,
        spreadsheetId: secrets.id,
        range: constants.code.range
      },
      rules: {
        token: constants.file,
        permission: constants.permission,
        spreadsheetId: secrets.id,
        range: constants.rules.range
      }
    };
    return { config, transformRules, transformCode };
  },
  execute: async(settings, day) => {
    const { code: codeConfig, rules: rulesConfig } = settings.config;

    // fetch the total count
    const count = await SheetApi.read(rulesConfig, settings.transformRules);

    // select a row to display
    const index = _findIndex(day, count);

    const range = codeConfig.range.replace(/\$/g, index);
    codeConfig.range = range;

    //fetch the row
    const row = await SheetApi.read(codeConfig, settings.transformCode);
    return row.map(_stringify);
  }
};
