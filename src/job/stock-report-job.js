const Promise = require('bluebird');
const constants = require('../../config/constants');
const BasicHelper = require('../lib/basic-helper');
const IteratorHelper = require('../lib/iterator-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const Logger = require('../lib/log-helper');
const SheetApi = require('../utility/google-sheet-api');
const StockApi = require('../utility/bloomberg-scraper');

function stringify(row) {
  const price = BasicHelper.pad(row.price, 6);
  const changeAmount = BasicHelper.pad(row.changeAmount, 6);
  return `${row.code} ${price} ${changeAmount}  ${row.name}`;
}

module.exports = {
  _stringify: stringify,
  fetch: async(options) => {
    try {
      Logger.log('get stock report...');
      // get code list
      const stockConst = constants.stock;
      const secrets = await JsonFileHelper.get(constants.secretPath(options.fake, 'stock.json'));

      const codeOptions = { spreadsheetId: secrets.id, range: stockConst.code.range };
      const codes = await SheetApi.get(stockConst.file, stockConst.scope, codeOptions);
      const codeJson = codes.map(row => IteratorHelper.toJson(row, stockConst.code.fields));

      // get price list
      const requests = codeJson.map(stock => StockApi.get(stock.code, stock.suffix));
      const priceJson = await Promise.all(requests);

      // merge code and price list
      const mergeList = codeJson.map(IteratorHelper.mergeJsonUsingKeyValue, priceJson);

      const itemList = mergeList.map(stringify);

      Logger.log('send stock report...', itemList.length);
      return BasicHelper.displayChat(itemList, stockConst.reportTitle, secrets.link);
    } catch (error) {
      Logger.log('cant fetch stock report', error);
    }
    Logger.log('no stock report');
    return '';
  }
};
