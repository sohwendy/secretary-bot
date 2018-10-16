const Promise = require('bluebird');
const constants = require('../../config/constants').stock;
const { arrayToHash2, leftJoin } = require('../lib/iterator-helper');
const BasicHelper = require('../lib/basic-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const Logger = require('../lib/log-helper');
const SheetApi = require('../utility/google-sheet-api');
const StockApi = require('../utility/alpha-vantage-api');

const INTERVAL_BETWEEN_API_CALL = 15000;

function stringify(row) {
  const price = BasicHelper.pad(row.price, 6);
  const range = BasicHelper.pad(`${row.min}-${row.max}`, 9);
  const name = BasicHelper.pad(row.name, 8);
  return `${row.short} ${price}  ${range} ${name} ${row.message}`;
}

function rule(row) {
  return (row.price >= row.min && row.price < row.max && row.done !== 'Y') ? true : false;
}

const Worker = {
  init: async(constants) => {
    const secrets = await JsonFileHelper.read(constants.secretFile);
    const transform = {
      code: arrayToHash2.bind(constants.code.fields),
      rule: arrayToHash2.bind(constants.rule.fields),
    };
    const config = {
      title: constants.monitorTitle,
      key: secrets.key2,
      code: {
        token: constants.file,
        permission: constants.scope,
        spreadsheetId: secrets.id,
        range: constants.code.range
      },
      rule: {
        token: constants.file,
        permission: constants.scope,
        spreadsheetId: secrets.id,
        range: constants.rule.range
      }
    };
    return { config, transform };
  },
  execute: async(settings) => {
    // get code and rule list
    let data = await Promise.all([
      SheetApi.read2(settings.config.code, settings.transform.code),
      SheetApi.read2(settings.config.rule, settings.transform.rule)
    ]);

    const codeJson = data[0];
    const ruleJson = data[1];

    // get price list
    const requests = codeJson.map((stock, index) => StockApi.get(settings.config.key, stock.code, index * INTERVAL_BETWEEN_API_CALL));
    const priceJson = await Promise.all(requests);


    let joinList = leftJoin(codeJson, priceJson, 'code');
    joinList = leftJoin(ruleJson, joinList, 'code');

    const result = joinList.filter(rule).map(stringify);
    return result;
  }
};

module.exports = {
  _rule: rule,
  _stringify: stringify,
  fetch: async() => {
    try {
      Logger.log('get stock monitor...');

      const settings = await Worker.init(constants);
      const result = await Worker.execute(settings);

      Logger.log('send stock monitor...', result.length);
      return BasicHelper.displayChat(result, settings.config.title);
    } catch (error) {
      Logger.log('cant fetch stock monitor', error);
    }
    Logger.log('no stock monitor');
    return '';
  },
  Worker
};
