const Promise = require('bluebird');
const constants = require('../../config/constants');
const IteratorHelper = require('../lib/iterator-helper');
const BasicHelper = require('../lib/basic-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const SheetApi = require('../utility/google-sheet-api');
const StockApi = require('../utility/bloomberg-scraper');

function stringify(row) {
  const price = BasicHelper.pad(row.price, 6);
  const range = BasicHelper.pad(`${row.min}-${row.max}`, 7);

  const name = BasicHelper.pad(row.name, 6);
  return `${row.code} ${price}  ${range} ${name}  ${row.message}`;
}

function rule(row) {
  return (row.price >= row.min && row.price < row.max && row.message && row.done !== 'y') ? true : false;
}

module.exports = {
  _rule: rule,
  _stringify: stringify,
  fetch: async(options) => {
    try {
      options.log('get stock monitor...');
      const stockConst = constants.stock;
      const secrets = await JsonFileHelper.get(constants.secretPath(options.fake, 'stock.json'), options.log);
      const rulesOptions = { spreadsheetId: secrets.id, range: stockConst.rule.range };
      const codeOptions = { spreadsheetId: secrets.id, range: stockConst.code.range };

      // get code and rule list
      let data = await Promise.all([
        SheetApi.get(stockConst.file, stockConst.scope, codeOptions, options.log),
        SheetApi.get(stockConst.file, stockConst.scope, rulesOptions, options.log)
      ]);

      const codeJson = data[0].map(row => IteratorHelper.toJson(row, stockConst.code.fields));
      const ruleJson = data[1].map(row => IteratorHelper.toJson(row, stockConst.rule.fields));

      // get price list
      const requests = codeJson.map(stock => StockApi.get(stock.code, stock.suffix, options.log));
      const priceJson = await Promise.all(requests);

      let mergeList = codeJson.map(IteratorHelper.mergeJsonUsingKeyValue, priceJson);
      mergeList = ruleJson.map(IteratorHelper.mergeJsonUsingKeyValue, mergeList);

      const fulfilRule = mergeList.filter(rule);
      const itemList = fulfilRule.map(stringify);
      options.log('send stock monitor...');
      return BasicHelper.displayChat(itemList, stockConst.monitorTitle);
    } catch (error) {
      options.log('cant fetch stock monitor', error);
    }
    return '';
  }
};
