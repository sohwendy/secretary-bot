const Promise = require('bluebird');
const BasicHelper = require('../lib/basic-helper');
const { arrayToHash, leftJoin } = require('../lib/iterator-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const SheetApi = require('../utility/google-sheet-api');
const RateApi = require('../utility/open-exchange-rate-api');

function _stringify(row) {
  const foreign = row.code.toLowerCase();
  const buyRate = BasicHelper.pad(row.buyRate, 6);
  const sellRate = BasicHelper.pad(row.sellRate, 6);

  return `${row.buyUnit}sgd ${buyRate}${foreign}    ${row.sellUnit}${foreign} ${sellRate}sgd\n` +
    `  ${row.watchlist}  (${row.min}, ${row.max})   ${row.message}`;
}

function _rule(row) {
  const rate = row.buysell === 'B' ? row.buyRate : row.sellRate;
  return rate >= row.min && rate < row.max && row.done !== 'Y' ? true : false;
}

module.exports = {
  _stringify,
  _rule,
  name: 'forex monitor',
  init: async(constants) => {
    const secretsApi = await JsonFileHelper.read(constants.rateSecretFile);
    const secretsForex = await JsonFileHelper.read(constants.secretFile);

    const transformCode = arrayToHash.bind(constants.code.fields);
    const transformRule = arrayToHash.bind(constants.rule.fields);
    const config = {
      title: constants.monitorTitle,
      rateKey: secretsApi.key,
      rule: {
        token: constants.file,
        permission: constants.permission,
        spreadsheetId: secretsForex.id,
        range: constants.rule.range
      },
      code: {
        token: constants.file,
        permission: constants.permission,
        spreadsheetId: secretsForex.id,
        range: constants.code.range
      },
    };
    return { config, transformCode, transformRule };
  },
  execute: async(settings) => {
    const { code: codeConfig, rule: ruleConfig, rateKey: key } = settings.config;

    const data = await Promise.all([
      RateApi.get({ key }),
      SheetApi.read(codeConfig, settings.transformCode),
      SheetApi.read(ruleConfig, settings.transformRule)
    ]);

    let joinList = leftJoin(data[0], data[1], 'code');
    joinList = leftJoin(data[2], joinList,  'code');

    joinList = joinList.map(BasicHelper.calculateUnit);

    const list = joinList.filter(_rule).map(_stringify);
    return list ;
  }
};
