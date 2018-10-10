const Promise = require('bluebird');
const constants = require('../../config/constants');
const BasicHelper = require('../lib/basic-helper');
const IteratorHelper = require('../lib/iterator-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const Logger = require('../lib/log-helper');
const SheetApi = require('../utility/google-sheet-api');
const StockApi = require('../utility/alpha-vantage-api');

function stringify(row) {
  const price = BasicHelper.pad(row.price, 6);
  const changeAmount = BasicHelper.pad(row.changeAmount, 6);
  return `${row.short} ${price} ${changeAmount}  ${row.name}`;
}

async function sendRequest(requests) {
  let reqGroup = [];
  while (requests.length > 0)
    reqGroup.push(requests.splice(0, 5));
  let group = [];
  for (let i = 0; i < reqGroup.length; i ++){
    group[i] = await Promise.all(reqGroup[i]);
  }

  const flatten = await group.reduce((acc, val) => acc.concat(val), []);
  return flatten;
}

module.exports = {
  _stringify: stringify,
  fetch: async() => {
    try {
      Logger.log('get stock report...');
      // get code list
      const stockConst = constants.stock;
      const secrets = await JsonFileHelper.get(constants.secretPath('stock.json'));

      const codeOptions = { spreadsheetId: secrets.id, range: stockConst.code.range };

      const codeJson = await SheetApi.get(stockConst.file, stockConst.scope, codeOptions, stockConst.code.fields);

      // get price list
      const requests = codeJson.map((stock, index) => StockApi.get(secrets.key1, stock.code, index * 15000));
      const priceJson = await sendRequest(requests);

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
