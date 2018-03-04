const Promise = require('bluebird');
const constants = require('../../config/constants');
const IteratorHelper = require('../lib/iterator-helper');
const BasicHelper = require('../lib/basic-helper');
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
  fetch: async (options) => {
    try {
      const secretStock = require(constants.secretPath(options.fake, 'stocks'));
      const rulesOptions = {spreadsheetId: secretStock.id, range: secretStock.rule.range};
      const codeOptions = {spreadsheetId: secretStock.id, range: secretStock.code.range};

      // get code and rule list
      let data = await Promise.all([
        SheetApi.get(secretStock.file, secretStock.scope, codeOptions),
        SheetApi.get(secretStock.file, secretStock.scope, rulesOptions)
      ]);

      const codeJson = data[0].map(row => IteratorHelper.toJson(row, secretStock.code.fields));
      const ruleJson = data[1].map(row => IteratorHelper.toJson(row, secretStock.rule.fields));

      // get price list
      const requests = codeJson.map(stock => StockApi.get(stock.code, stock.suffix));
      const priceJson = await Promise.all(requests);

      let mergeList = codeJson.map(IteratorHelper.mergeJsonUsingKeyValue, priceJson);
      mergeList = ruleJson.map(IteratorHelper.mergeJsonUsingKeyValue, mergeList);

      const fulfilRule = mergeList.filter(rule);
      options.log('stock monitor...');
      const itemList = fulfilRule.map(stringify);
      return BasicHelper.displayChat(itemList, constants.stock.monitorTitle);
    } catch (error) {
      options.log('cant fetch stock monitor', error);
    }
    return '';
  }
};
