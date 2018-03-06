const Promise = require('bluebird');
const constants = require('../../config/constants');
const BasicHelper = require('../lib/basic-helper');
const IteratorHelper = require('../lib/iterator-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const SheetApi = require('../utility/google-sheet-api');
const RateApi = require('../utility/open-exchange-rate-api');

function stringify(row) {
  const foreign = row.code.toLowerCase();
  const buyRate = BasicHelper.pad(row.buyRate, 7);
  const sellRate = BasicHelper.pad(row.sellRate, 7);
  const sellUnit = BasicHelper.pad(row.sellUnit, 5);

  return `${row.buyUnit} sgd${foreign} ${buyRate} ${sellUnit} ${foreign}sgd ${sellRate}`;
}

module.exports = {
  _stringify: stringify,
  fetch: async(options) => {
    try {
      options.log('get forex report...');

      const forexConst = constants.forex;
      const secretsApi = await JsonFileHelper.get(constants.secretPath(options.fake, 'oer.json'), options.log);
      const secretsForex = await JsonFileHelper.get(constants.secretPath(options.fake, 'forex.json'), options.log);
      const codeOptions = { spreadsheetId: secretsForex.id, range: forexConst.code.range };

      const data = await Promise.all([
        RateApi.get(secretsApi.key, options.log),
        SheetApi.get(forexConst.file, forexConst.scope, codeOptions, options.log),
      ]);

      const rawPriceJson = data[0];
      const codeJson = data[1].map(row => IteratorHelper.toJson(row, forexConst.code.fields));

      // merge code and price list
      let mergeList = codeJson.map(IteratorHelper.mergeJsonUsingKey, rawPriceJson);
      // calculate the exchange rate
      const fullItem = mergeList.map(BasicHelper.calculateExchangeRate, rawPriceJson['SGD']);
      const itemList = fullItem.map(stringify);
      options.log('send forex report...');
      return BasicHelper.displayChat(itemList, forexConst.reportTitle, secretsForex.link);
    } catch (error) {
      options.log('cant fetch forex report', error);
    }
    return '';
  }
};
