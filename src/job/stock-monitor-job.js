const Promise = require('bluebird');
const constants = require('../../config/constants');
const IteratorHelper = require('../lib/iterator-helper');
const BasicHelper = require('../lib/basic-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const Logger = require('../lib/log-helper');
const SheetApi = require('../utility/google-sheet-api');
const StockApi = require('../utility/bloomberg-scraper');

function stringify(row) {
  const price = BasicHelper.pad(row.price, 6);
  const range = BasicHelper.pad(`${row.min}-${row.max}`, 9);
  const name = BasicHelper.pad(row.name, 8);
  return `${row.code} ${price}  ${range} ${name} ${row.message}`;
}

function rule(row) {
  return (row.price >= row.min && row.price < row.max && row.done !== 'Y') ? true : false;
}

module.exports = {
  _rule: rule,
  _stringify: stringify,
  fetch: async(options) => {
    try {
      Logger.log('get stock monitor...');
      const stockConst = constants.stock;
      const secrets = await JsonFileHelper.get(constants.secretPath(options.fake, 'stock.json'));
      const rulesOptions = { spreadsheetId: secrets.id, range: stockConst.rule.range };
      const codeOptions = { spreadsheetId: secrets.id, range: stockConst.code.range };

      // get code and rule list
      let data = await Promise.all([
        SheetApi.get(stockConst.file, stockConst.scope, codeOptions),
        SheetApi.get(stockConst.file, stockConst.scope, rulesOptions)
      ]);

      const codeJson = data[0].map(row => IteratorHelper.toJson(row, stockConst.code.fields));
      const ruleJson = data[1].map(row => IteratorHelper.toJson(row, stockConst.rule.fields));

      // get price list
      const requests = codeJson.map(stock => StockApi.get(stock.code, stock.suffix));
      const priceJson = await Promise.all(requests);

      let mergeList = codeJson.map(IteratorHelper.mergeJsonUsingKeyValue, priceJson);
      mergeList = ruleJson.map(IteratorHelper.mergeJsonUsingKeyValue, mergeList);

      const fulfilRule = mergeList.filter(rule);
      const itemList = fulfilRule.map(stringify);
      Logger.log('send stock monitor...', itemList.length);
      return BasicHelper.displayChat(itemList, stockConst.monitorTitle);
    } catch (error) {
      Logger.log('cant fetch stock monitor', error);
    }
    Logger.log('no stock monitor');
    return '';
  }
};
