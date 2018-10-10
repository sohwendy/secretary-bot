const constants = require('../../config/constants');
const JsonFileHelper = require('../lib/json-file-helper');
const Logger = require('../lib/log-helper');
const IteratorHelper = require('../lib/iterator-helper');
const SheetApi = require('../utility/google-sheet-api');
const BankForexApi = require('../utility/dbs-scraper');

function generateDataArray(data, initial) {
  return data.reduce((array, current) => {
    return array.concat([current.sellPrice, current.buyTTPrice, current.buyODPrice]);
  }, initial);
}

const header = [
  ['id', '', ''],
  ['code', '', ''],
  ['buyRate', 'sellRate', '']
];

const readSheet = async(spreadsheetId, options) => {
  const readOptions = { spreadsheetId, range: options.read.range };
  const codeList = await SheetApi.get(options.file, options.scope, readOptions);

  return IteratorHelper.matrixToHash(codeList, header);
};

const writeSheet = async(data, spreadsheetId, options) => {
  // get the scraped data
  const dataCells = generateDataArray(data.data, [data.date]);

  // write to excel
  const writeOptions = { spreadsheetId, range: options.write.range };
  return await SheetApi.set(options.file, options.scope, writeOptions, dataCells);
};

module.exports = {
  _generateDataArray: generateDataArray,
  _readSheet: readSheet,
  _writeSheet: writeSheet,
  update: async() => {
    try {
      Logger.log('get bank forex report...');

      const bankforexConst = constants.bankforex;
      const secretsForex = await JsonFileHelper.get(constants.secretPath('bankforex.json'));

      const meta = await readSheet(secretsForex.id, bankforexConst);
      const data = await BankForexApi.get(meta);

      const count = await writeSheet(data, secretsForex.id, bankforexConst);
      Logger.log(`bank forex report ok... ${count}`);
      return count;

    } catch (err) {
      Logger.log('cant fetch bank forex report', err);
    }
    Logger.log('bank forex report ended');
    return '';
  }
};
