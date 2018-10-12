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
  const sellUnit = BasicHelper.pad(row.sellUnit, 4);
  return `${row.buyUnit}sgd ${buyRate}${foreign}  ${sellUnit}${foreign} ${sellRate}sgd ${row.watchlist}`;
}

module.exports = {
  _stringify: stringify,
  fetch: async() => {
    try {
      Logger.log('get forex report...');

      const forexConst = constants.forex;
      const secretsApi = await JsonFileHelper.read(forexConst.rateSecretFile);
      const secretsForex = await JsonFileHelper.read(forexConst.secretFile);
      const codeOptions = { spreadsheetId: secretsForex.id, range: forexConst.code.range };

      const data = await Promise.all([
        RateApi.get(secretsApi.key),
        SheetApi.read(forexConst.file, forexConst.scope, codeOptions, forexConst.code.fields),
      ]);

      const rawPriceJson = data[0];
      const codeJson = data[1];

      // merge code and price list
      let mergeList = codeJson.map(IteratorHelper.mergeHashUsingKey, rawPriceJson);
      // calculate the exchange rate
      const fullItem = mergeList.map(BasicHelper.calculateExchangeRate, rawPriceJson['SGD']);
      const itemList = fullItem.map(stringify);
      Logger.log('send forex report...', itemList.length);
      return BasicHelper.displayChat(itemList, forexConst.reportTitle, secretsForex.link);
    } catch (error) {
      Logger.log('cant fetch forex report', error);
    }
    Logger.log('no forex report');
    return '';
  }
};
