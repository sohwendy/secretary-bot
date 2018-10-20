const JsonFileHelper = require('../lib/json-file-helper');
const { hashToMatrix, matrixToHash } = require('../lib/iterator-helper');
const SheetApi = require('../utility/google-sheet-api');
const BankForexApi = require('../utility/dbs-scraper');

function _transformHashToArray(hash, keys){
  const data = hashToMatrix(hash.data, keys);
  const result = data.reduce((acc, row) => acc.concat(row), [hash.date]);
  return result;
}

module.exports = {
  _transformHashToArray,
  name: 'bankforex reporter',
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
    const { config, transform, fields } = settings;
    const requested = await SheetApi.read(config, transform);
    const response = await BankForexApi.get(requested);
    const results = _transformHashToArray(response, fields);

    return await SheetApi.write2(config, results);
  }
};
