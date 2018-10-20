import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');
const constants = require('../../config/constants').bankforex;
const SheetApi = require('../../src/utility/google-sheet-api');
const BankForexApi = require('../../src/utility/dbs-scraper');

test.beforeEach(t => {
  let sandbox = sinon.createSandbox();

  t.context.sandbox = sandbox;
  t.context.sheetApiMock  = sandbox.mock(SheetApi);
  t.context.worker = rewire('../../src/worker/bank-forex-report-worker');
  const { worker } = t.context;

  t.context.bankForexMock = sandbox.mock(BankForexApi);

  constants.secretFile = './sample/bankforex.json';
  constants.file = './sample/google.json';
  worker.__set__('constants', constants);
});

test.afterEach.always(t => {
  t.context.sandbox.restore();
});

test('_transformHashToArray works', async t => {
  const expected = ['01-Jan-2018', '1.0', '1.1', '1.2', '2.0', '2.1','2.2'];
  const data = {
    date: '01-Jan-2018',
    data: [
      { sellPrice: '1.0', buyTTPrice: '1.1', buyODPrice: '1.2' },
      { sellPrice: '2.0', buyTTPrice: '2.1', buyODPrice: '2.2' }
    ]
  };
  const actual = t.context.worker._transformHashToArray(data, constants.write.fields);

  t.deepEqual(expected, actual);
});

test('init() returns config', async t => {
  const expected = {
    token: constants.file,
    permission: constants.permission,
    spreadsheetId: '<bank forex>',
    range: constants.read.range
  };

  const actual = await t.context.worker.init(constants);

  t.deepEqual(expected, actual.config);
});

test('init() returns transform', async t => {
  const { worker, sandbox } = t.context;

  const matrixToHash = { bind: sandbox.stub() };

  worker.__set__('matrixToHash', matrixToHash);

  await worker.init(constants);

  t.is(matrixToHash.bind.callCount, 1);
  t.is(matrixToHash.bind.calledWithExactly(constants.read.fields), true);
});

const rateData = {
  date: '13/10/2018 1:18AM',
  data: [
    { id: 'australiandollar',
      code: 'AUD',
      buyRate: 1,
      sellRate: 1,
      sellPrice: '0.9935',
      buyTTPrice: '0.9659',
      buyODPrice: '0.9625' },
    { id: 'japaneseyen',
      code: 'JPY',
      buyRate: 100,
      sellRate: 1,
      sellPrice: '1.2453',
      buyTTPrice: '1.2154',
      buyODPrice: '1.2152' },
  ]
};

const sheetData = [
  { id: 'australiandollar', code: 'AUD', buyRate: 1, sellRate: 1 },
  { id: 'japaneseyen', code: 'JPY', buyRate: 100, sellRate: 1 }
];

const result = [
  '13/10/2018 1:18AM',
  '0.9935',
  '0.9659',
  '0.9625',
  '1.2453',
  '1.2154',
  '1.2152'
];

test('execute() works', async t => {
  const { worker, sheetApiMock, bankForexMock } = t.context;
  const settings = {
    config: { },
    transform: () => {},
    fields: constants.write.fields
  };

  sheetApiMock
    .expects('read')
    .withExactArgs(settings.config, settings.transform)
    .once()
    .returns(sheetData);

  bankForexMock
    .expects('get')
    .withExactArgs(sheetData)
    .once()
    .returns(rateData);

  sheetApiMock
    .expects('write2')
    .withExactArgs(settings.config, result)
    .once()
    .returns(result.length);

  const count = await worker.execute(settings);

  t.true(sheetApiMock.verify());
  t.true(bankForexMock.verify());
  t.is(count, 7);
});
