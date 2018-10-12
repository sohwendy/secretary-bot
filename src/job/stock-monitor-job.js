const Promise = require('bluebird');
const constants = require('../../config/constants');
const IteratorHelper = require('../lib/iterator-helper');
const BasicHelper = require('../lib/basic-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const Logger = require('../lib/log-helper');
const SheetApi = require('../utility/google-sheet-api');
const StockApi = require('../utility/alpha-vantage-api');

function stringify(row) {
  const price = BasicHelper.pad(row.price, 6);
  const range = BasicHelper.pad(`${row.min}-${row.max}`, 9);
  const name = BasicHelper.pad(row.name, 8);
  return `${row.short} ${price}  ${range} ${name} ${row.message}`;
}

function rule(row) {
  return (row.price >= row.min && row.price < row.max && row.done !== 'Y') ? true : false;
}

module.exports = {
  _rule: rule,
  _stringify: stringify,
  fetch: async() => {
    try {
      Logger.log('get stock monitor...');
      const stockConst = constants.stock;
      const secrets = await JsonFileHelper.read(stockConst.secretFile);
      const rulesOptions = { spreadsheetId: secrets.id, range: stockConst.rule.range };
      const codeOptions = { spreadsheetId: secrets.id, range: stockConst.code.range };

      // get code and rule list
      let data = await Promise.all([
        SheetApi.read(stockConst.file, stockConst.scope, codeOptions, stockConst.code.fields),
        SheetApi.read(stockConst.file, stockConst.scope, rulesOptions, stockConst.rule.fields)
      ]);

      const codeJson = data[0];
      const ruleJson = data[1];

      // get price list
      const requests = codeJson.map((stock, index) => StockApi.get(secrets.key2, stock.code, index * 15000));
      const priceJson = await Promise.all(requests);

      // console.log('priceJson', priceJson)
      let mergeList = codeJson.map(IteratorHelper.mergeHashUsingKeyValue, priceJson);
      mergeList = ruleJson.map(IteratorHelper.mergeHashUsingKeyValue, mergeList);

      // console.log('priceJson', priceJson)

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
