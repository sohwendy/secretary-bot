const Promise = require('bluebird');
const constants = require('../../config/constants');
const BasicHelper = require('../lib/basic-helper');
const IteratorHelper = require('../lib/iterator-helper');
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
  fetch: async (options) => {
    try {
      const secretsApi = require(constants.secretPath(options.fake, 'oer'));
      const secretsForex = require(constants.secretPath(options.fake, 'forex'));
      const codeOptions = {spreadsheetId: secretsForex.id, range: secretsForex.code.range};

      const data = await Promise.all([
        RateApi.get(secretsApi.key),
        SheetApi.get(secretsForex.file, secretsForex.scope, codeOptions),
      ]);

      const rawPriceJson = data[0];
      const codeJson = data[1].map(row => IteratorHelper.toJson(row, secretsForex.code.fields));

      // merge code and price list
      let mergeList = codeJson.map(IteratorHelper.mergeJsonUsingKey, rawPriceJson);
      // calculate the exchange rate
      const fullItem = mergeList.map(BasicHelper.calculateExchangeRate, rawPriceJson['SGD']);

      options.log('forex report...');

      const itemList = fullItem.map(stringify);
      return BasicHelper.displayChat(itemList, constants.forex.reportTitle, secretsForex.link);

    } catch (error) {
      options.log('cant fetch forex report', error);
    }
    return '';
  }
};
