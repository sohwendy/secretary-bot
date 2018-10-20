const Promise = require('bluebird');
const { arrayToHash, leftJoin } = require('../lib/iterator-helper');
const BasicHelper = require('../lib/basic-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const SheetApi = require('../utility/google-sheet-api');
const StockApi = require('../utility/alpha-vantage-api');

const INTERVAL_BETWEEN_API_CALL = 15000;

function _stringify(row) {
  const code = BasicHelper.pad(row.short, 4);
  const price = BasicHelper.pad(Number.parseFloat(row.price), 6);
  const range = BasicHelper.pad(`${row.min}-${row.max}`, 9);
  const name = BasicHelper.pad(row.name, 8);
  return `${code}  ${price}  ${range} ${name} ${row.message}`;
}

function _rule(row) {
  return (row.price >= row.min && row.price < row.max && row.done !== 'Y') ? true : false;
}

module.exports = {
  _stringify,
  _rule,
  name: 'stock monitor',
  init: async(constants) => {
    const secrets = await JsonFileHelper.read(constants.secretFile);
    const transform = {
      code: arrayToHash.bind(constants.code.fields),
      rule: arrayToHash.bind(constants.rule.fields),
    };
    const config = {
      title: constants.monitorTitle,
      key: secrets.key2,
      code: {
        token: constants.file,
        permission: constants.permission,
        spreadsheetId: secrets.id,
        range: constants.code.range
      },
      rule: {
        token: constants.file,
        permission: constants.permission,
        spreadsheetId: secrets.id,
        range: constants.rule.range
      }
    };
    return { config, transform };
  },
  execute: async(settings) => {
    // get code and rule list
    let data = await Promise.all([
      SheetApi.read(settings.config.code, settings.transform.code),
      SheetApi.read(settings.config.rule, settings.transform.rule)
    ]);

    const codeJson = data[0];
    const ruleJson = data[1];

    // get price list
    const requests = codeJson.map((stock, index) => StockApi.get(settings.config.key, stock.code, index * INTERVAL_BETWEEN_API_CALL));
    const priceJson = await Promise.all(requests);


    let joinList = leftJoin(codeJson, priceJson, 'code');
    joinList = leftJoin(ruleJson, joinList, 'code');

    const result = joinList.filter(_rule).map(_stringify);
    return result;
  }
};
