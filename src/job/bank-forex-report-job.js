const constants = require('../../config/constants');
const JsonFileHelper = require('../lib/json-file-helper');
const Logger = require('../lib/log-helper');
const SheetApi = require('../utility/google-sheet-api');
const BankForexApi = require('../utility/dbs-scraper');

function generateDataArray(data, initial) {
  return data.reduce((array, current) => {
    return array.concat([current.sellPrice, current.buyTTPrice, current.buyODPrice]);
  }, initial);
}

function generateMeta(list) {
  const codes = list[0].filter(c => c);

  return codes.map((cell, index) => {
    const col = index * 3 ;
    return {
      id: cell,
      code: list[1][col],
      buyRate: list[2][col],
      sellRate: list[2][col + 1]
    };
  });
}

const readSheet = async(spreadsheetId, options) => {
  const readOptions = { spreadsheetId, range: options.read.range };
  const codeList = await SheetApi.read(options.file, options.scope, readOptions);
  return generateMeta(codeList);
};

const writeSheet = async(data, spreadsheetId, options) => {
  const dataCells = generateDataArray(data.data, [data.date]);
  const writeOptions = { spreadsheetId, range: options.write.range };
  return await SheetApi.write(options.file, options.scope, writeOptions, dataCells);
};

module.exports = {
  _generateDataArray: generateDataArray,
  _generateMeta: generateMeta,
  _readSheet: readSheet,
  _writeSheet: writeSheet,
  update: async() => {
    try {
      Logger.log('get bank forex report...');

      const bankforexConst = constants.bankforex;
      const secretsForex = await JsonFileHelper.read(constants.secretPath('bankforex.json'));

      const meta = await readSheet(secretsForex.id, bankforexConst);
      const data = await BankForexApi.get(meta);
      const count = await writeSheet(data, secretsForex.id, bankforexConst);
      Logger.log(`bank forex report ok... ${count}`);
      return count;
    } catch (err) {
      Logger.log('cant fetch bank forex report', err);
      return 0;
    }
  }
};
