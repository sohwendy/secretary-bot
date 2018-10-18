const Promise = require('bluebird');
const constants = require('../../config/constants').forex;
const BasicHelper = require('../lib/basic-helper');
const { arrayToHash2, leftJoin } = require('../lib/iterator-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const Logger = require('../lib/log-helper');
const SheetApi = require('../utility/google-sheet-api');
const RateApi = require('../utility/open-exchange-rate-api');

function stringify(row) {
  const foreign = row.code.toLowerCase();
  const buyRate = BasicHelper.pad(row.buyRate, 6);
  const sellRate = BasicHelper.pad(row.sellRate, 6);

  return `${row.buyUnit}sgd ${buyRate}${foreign}    ${row.sellUnit}${foreign} ${sellRate}sgd\n` +
    `  ${row.watchlist}  (${row.min}, ${row.max})   ${row.message}`;
}

function rule(row) {
  const rate = row.buysell === 'B' ? row.buyRate : row.sellRate;
  return rate >= row.min && rate < row.max && row.done !== 'Y' ? true : false;
}

const Worker = {
  init: async(constants) => {
    const secretsApi = await JsonFileHelper.read(constants.rateSecretFile);
    const secretsForex = await JsonFileHelper.read(constants.secretFile);

    const transformCode = arrayToHash2.bind(constants.code.fields);
    const transformRule = arrayToHash2.bind(constants.rule.fields);
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
      RateApi.get2({ key }),
      SheetApi.read2(codeConfig, settings.transformCode),
      SheetApi.read2(ruleConfig, settings.transformRule)
    ]);

    let joinList = leftJoin(data[0], data[1], 'code');
    joinList = leftJoin(data[2], joinList,  'code');

    joinList = joinList.map(BasicHelper.calculateUnit);

    const list = joinList.filter(rule).map(stringify);
    return list ;
  }
};

module.exports = {
  _rule: rule,
  _stringify: stringify,
  fetch: async() => {
    try {
      Logger.log('get forex monitor...');

      const settings = await Worker.init(constants);
      const list = await Worker.execute(settings);

      Logger.log('send forex monitor...', list.length);
      return BasicHelper.displayChat(list, settings.config.title);
    } catch (error) {
      Logger.log('cant fetch forex monitor', error);
    }
    Logger.log('no forex monitor');
    return '';
  },
  Worker
};

