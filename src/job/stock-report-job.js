const Promise = require('bluebird');
const constants = require('../../config/constants').stock;
const BasicHelper = require('../lib/basic-helper');
const { arrayToHash2, leftJoin } = require('../lib/iterator-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const Logger = require('../lib/log-helper');
const SheetApi = require('../utility/google-sheet-api');
const StockApi = require('../utility/alpha-vantage-api');

const INTERVAL_BETWEEN_API_CALL = 15000;

function stringify(row) {
  const price = BasicHelper.pad(row.price, 6);
  const changeAmount = BasicHelper.pad(row.changeAmount, 6);
  return `${row.short} ${price} ${changeAmount}  ${row.name}`;
}

const Worker = {
  init: async(constants) => {
    const secrets = await JsonFileHelper.read(constants.secretFile);
    const transform = arrayToHash2.bind(constants.code.fields);
    const config = {
      title: constants.reportTitle,
      key: secrets.key1,
      code: {
        token: constants.file,
        permission: constants.scope,
        spreadsheetId: secrets.id,
        range: constants.code.range
      },
    };
    return { config, transform };
  },
  execute: async(settings) => {
    const codeJson = await SheetApi.read2(settings.config.code, settings.transform);
    // get price list
    const requests = codeJson.map((stock, index) => StockApi.get(settings.key, stock.code, index * INTERVAL_BETWEEN_API_CALL));

    const priceJson = await Promise.all(requests);

    const joinList = leftJoin(codeJson, priceJson, 'code');
    return joinList.map(stringify);
  }
};

module.exports = {
  _stringify: stringify,
  fetch: async() => {
    try {
      Logger.log('get stock report...');

      const settings = await Worker.init(constants);
      const result = await Worker.execute(settings);

      Logger.log('send stock report...', result.length);

      return BasicHelper.displayChat(result, settings.config.title);
    } catch (error) {
      Logger.log('cant fetch stock report', error);
    }
    Logger.log('no stock report');
    return '';
  },
  Worker
};
