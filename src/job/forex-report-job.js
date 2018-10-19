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
  const sellUnit = BasicHelper.pad(row.sellUnit, 4);
  return `${row.buyUnit}sgd ${buyRate}${foreign}  ${sellUnit}${foreign} ${sellRate}sgd ${row.watchlist}`;
}

const Worker = {
  init: async(constants) => {
    const secretsApi = await JsonFileHelper.read(constants.rateSecretFile);
    const secretsForex = await JsonFileHelper.read(constants.secretFile);

    const transform = arrayToHash2.bind(constants.code.fields);
    const config = {
      title: constants.reportTitle,
      rateKey: secretsApi.key,
      code: {
        token: constants.file,
        permission: constants.permission,
        spreadsheetId: secretsForex.id,
        range: constants.code.range
      },
    };
    return { config, transform };
  },
  execute: async(settings) => {
    const { code: codeConfig, rateKey: key } = settings.config;

    const data = await Promise.all([
      RateApi.get({ key }),
      SheetApi.read(codeConfig, settings.transform),
    ]);

    let joinList = leftJoin(data[0], data[1], 'code');
    joinList = joinList.map(BasicHelper.calculateUnit);
    const list = joinList.map(stringify);
    return list ;
  }
};

module.exports = {
  _stringify: stringify,
  fetch: async() => {
    try {
      Logger.log('get forex report...');

      const settings = await Worker.init(constants);
      const list = await Worker.execute(settings);

      Logger.log('send forex report...', list.length);
      return BasicHelper.displayChat(list, settings.config.title);
    } catch (error) {
      Logger.log('cant fetch forex report', error);
    }
    Logger.log('no forex report');
    return '';
  },
  Worker
};
