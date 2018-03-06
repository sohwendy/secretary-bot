const Promise = require('bluebird');
const constants = require('../../config/constants');
const BasicHelper = require('../lib/basic-helper');
const IteratorHelper = require('../lib/iterator-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const Logger = require('../lib/log-helper');
const SheetApi = require('../utility/google-sheet-api');
const RateApi = require('../utility/open-exchange-rate-api');

function stringify(row) {
  return `${row.sellUnit} ${row.code} to ${row.sellRate} sgd   (${row.min}, ${row.max}) ${row.message}`;
}

function rule(row) {
  return row.sellRate >= row.min && row.sellRate < row.max && row.message ? true : false;
}

module.exports = {
  _rule: rule,
  _stringify: stringify,
  fetch: async(options) => {
    try {
      Logger.log('get forex monitor...');

      const forexConst = constants.forex;

      const secretsApi = await JsonFileHelper.get(constants.secretPath(options.fake, 'oer.json'));
      const secretsForex = await JsonFileHelper.get(constants.secretPath(options.fake, 'forex.json'));

      const rulesOptions = { spreadsheetId: secretsForex.id, range: forexConst.rule.range };
      const codeOptions = { spreadsheetId: secretsForex.id, range: forexConst.code.range };

      const data = await Promise.all([
        RateApi.get(secretsApi.key),
        SheetApi.get(forexConst.file, forexConst.scope, codeOptions),
        SheetApi.get(forexConst.file, forexConst.scope, rulesOptions)
      ]);

      const rawPriceJson = data[0];
      const codeJson = data[1].map(row => IteratorHelper.toJson(row, forexConst.code.fields));
      const ruleJson = data[2].map(row => IteratorHelper.toJson(row, forexConst.rule.fields));

      // merge code and price list
      let mergeList = codeJson.map(IteratorHelper.mergeJsonUsingKey, rawPriceJson);

      // calculate the exchange rate
      const fullItem = mergeList.map(BasicHelper.calculateExchangeRate, rawPriceJson['SGD']);
      // merge rules and code & price

      const fullRule = ruleJson.map(IteratorHelper.mergeJsonUsingKeyValue, fullItem);

      const fulfilRule = fullRule.filter(rule);

      const itemList = fulfilRule.map(stringify);

      Logger.log('send forex monitor...', itemList.length);
      return BasicHelper.displayChat(itemList, forexConst.monitorTitle);
    } catch (error) {
      Logger.log('cant fetch forex monitor', error);
    }
    Logger.log('no forex monitor');
    return '';
  }
};

