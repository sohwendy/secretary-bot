const Promise = require('bluebird');
const constants = require('../../config/constants');
const BasicHelper = require('../lib/basic-helper');
const IteratorHelper = require('../lib/iterator-helper');
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

module.exports = {
  _rule: rule,
  _stringify: stringify,
  fetch: async() => {
    try {
      Logger.log('get forex monitor...');

      const forexConst = constants.forex;

      const secretsApi = await JsonFileHelper.read(constants.secretPath('oer.json'));
      const secretsForex = await JsonFileHelper.read(constants.secretPath('forex.json'));

      const rulesOptions = { spreadsheetId: secretsForex.id, range: forexConst.rule.range };
      const codeOptions = { spreadsheetId: secretsForex.id, range: forexConst.code.range };

      const data = await Promise.all([
        RateApi.get(secretsApi.key),
        SheetApi.read(forexConst.file, forexConst.scope, codeOptions, forexConst.code.fields),
        SheetApi.read(forexConst.file, forexConst.scope, rulesOptions, forexConst.rule.fields)
      ]);

      const rawPriceJson = data[0];
      const codeJson = data[1];
      const ruleJson = data[2];

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

