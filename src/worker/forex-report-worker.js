const Promise = require('bluebird');
const BasicHelper = require('../lib/basic-helper');
const { arrayToHash, leftJoin } = require('../lib/iterator-helper');
const JsonFileHelper = require('../lib/json-file-helper');
const SheetApi = require('../utility/google-sheet-api');
const RateApi = require('../utility/open-exchange-rate-api');

function _stringify(row) {
  const foreign = row.code.toLowerCase();
  const buyRate = BasicHelper.pad(row.buyRate, 6);
  const sellRate = BasicHelper.pad(row.sellRate, 6);
  const sellUnit = BasicHelper.pad(row.sellUnit, 4);
  return `${row.buyUnit}sgd ${buyRate}${foreign}  ${sellUnit}${foreign} ${sellRate}sgd ${row.watchlist}`;
}

module.exports = {
  _stringify,
  name: 'forex reporter',
  init: async(constants) => {
    const secretsApi = await JsonFileHelper.read(constants.rateSecretFile);
    const secretsForex = await JsonFileHelper.read(constants.secretFile);

    const transform = arrayToHash.bind(constants.code.fields);
    const config = {
      title: constants.reportTitle,
      rateKey: secretsApi.key,
      code: {
        token: constants.file,
        permission: constants.permission,
        spreadsheetId: secretsForex.id,
        range: constants.code.range
      },
    };
    return { config, transform };
  },
  execute: async(settings) => {
    const { code: codeConfig, rateKey: key } = settings.config;

    const data = await Promise.all([
      RateApi.get({ key }),
      SheetApi.read(codeConfig, settings.transform),
    ]);

    let joinList = leftJoin(data[0], data[1], 'code');
    joinList = joinList.map(BasicHelper.calculateUnit);
    const list = joinList.map(_stringify);
    return list ;
  }
};
