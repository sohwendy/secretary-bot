const Promise = require('bluebird');
const BasicHelper = require('../lib/basic-helper');
const { arrayToHash, leftJoin } = require('../lib/iterator-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const SheetApi = require('../utility/google-sheet-api');
const StockApi = require('../utility/alpha-vantage-api');

const INTERVAL_BETWEEN_API_CALL = 15000;

function _stringify(row) {
  const code = BasicHelper.pad(row.short, 4);
  const price = BasicHelper.pad(Number.parseFloat(row.price), 6);
  const changeAmount = BasicHelper.pad(Number.parseFloat(row.changeAmount), 6);
  return `${code} ${price} ${changeAmount}  ${row.name}`;
}

module.exports = {
  _stringify,
  name: 'stock reporter',
  init: async(constants) => {
    const secrets = await JsonFileHelper.read(constants.secretFile);
    const transform = arrayToHash.bind(constants.code.fields);
    const config = {
      title: constants.reportTitle,
      key: secrets.key1,
      code: {
        token: constants.file,
        permission: constants.permission,
        spreadsheetId: secrets.id,
        range: constants.code.range
      },
    };
    return { config, transform };
  },
  execute: async(settings) => {
    const codeJson = await SheetApi.read(settings.config.code, settings.transform);
    // get price list
    const requests = codeJson.map((stock, index) => StockApi.get(settings.key, stock.code, index * INTERVAL_BETWEEN_API_CALL));

    const priceJson = await Promise.all(requests);

    const joinList = leftJoin(codeJson, priceJson, 'code');
    return joinList.map(_stringify);
  }
};
