const constants = require('../../config/constants').bankforex;
const JsonFileHelper = require('../lib/json-file-helper');
const Logger = require('../lib/log-helper');
const { hashToMatrix, matrixToHash } = require('../lib/iterator-helper');
const SheetApi = require('../utility/google-sheet-api');
const BankForexApi = require('../utility/dbs-scraper');

function transformHashToArray(hash){
  const keys = constants.write.fields;
  const data = hashToMatrix(hash.data, keys);
  const result = data.reduce((acc, row) => acc.concat(row), [hash.date]);
  return result;
}

const Worker = {
  init: async(constants) => {
    const secrets = await JsonFileHelper.read(constants.secretFile);

    const transform = matrixToHash.bind(constants.read.fields);
    const config = {
      token: constants.file,
      permission: constants.permission,
      spreadsheetId: secrets.id,
      range: constants.read.range
    };
    return { config, transform };
  },
  execute: async(settings) => {
    const { config, transform } = settings;
    const requested = await SheetApi.read(config, transform);
    const response = await BankForexApi.get(requested);
    const results = transformHashToArray(response);

    return await SheetApi.write2(config, results);
  }
};

module.exports = {
  Worker,
  _transformHashToArray: transformHashToArray,
  update: async() => {
    try {
      Logger.log('get bank forex report...');

      const settings = await Worker.init(constants);
      const count = await Worker.execute(settings);
      Logger.log(`bank forex report ok... ${count}`);

      return count;
    } catch (err) {
      Logger.log('cant fetch bank forex report', err);
      return 0;
    }
  },
};
