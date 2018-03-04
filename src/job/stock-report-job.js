const Promise = require('bluebird');
const constants = require('../../config/constants');
const IteratorHelper = require('../lib/iterator-helper');
const BasicHelper = require('../lib/basic-helper');
const SheetApi = require('../utility/google-sheet-api');
const StockApi = require('../utility/bloomberg-scraper');

function stringify(row) {
  const price = BasicHelper.pad(row.price, 6);
  const changeAmount = BasicHelper.pad(row.changeAmount, 6);
  return `${row.code} ${price} ${changeAmount}  ${row.name}`;
}

module.exports = {
  _stringify: stringify,
  fetch: async (options) => {
    try {
      // get code list
      const secrets = require(constants.secretPath(options.fake, 'stocks'));
      const codeOptions = {spreadsheetId: secrets.id, range: secrets.code.range};

      const codes = await SheetApi.get(secrets.file, secrets.scope, codeOptions);
      const codeJson = codes.map(row => IteratorHelper.toJson(row, secrets.code.fields));

      // get price list
      const requests = codeJson.map(stock => StockApi.get(stock.code, stock.suffix));
      const priceJson = await Promise.all(requests);

      // merge code and price list
      const mergeList = codeJson.map(IteratorHelper.mergeJsonUsingKeyValue, priceJson);
      options.log('stock report...');
      const itemList = mergeList.map(stringify);
      return BasicHelper.displayChat(itemList, constants.stock.reportTitle, secrets.link);
    } catch (error) {
      options.log('cant fetch stock report', error);
    }
    return '';
  }
};
