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
  t.context.job = rewire('../../src/job/bank-forex-report-job');
  const { job } = t.context;

  t.context.bankForexMock = sandbox.mock(BankForexApi);

  constants.secretFile = './sample/bankforex.json';
  constants.file = './sample/google.json';
  job.__set__('constants', constants);
});

test.afterEach.always(t => {
  t.context.sandbox.restore();
});

test('transformHashToArray works', async t => {
  const expected = ['01-Jan-2018', '1.0', '1.1', '1.2', '2.0', '2.1','2.2'];
  const data = {
    date: '01-Jan-2018',
    data: [
      { sellPrice: '1.0', buyTTPrice: '1.1', buyODPrice: '1.2' },
      { sellPrice: '2.0', buyTTPrice: '2.1', buyODPrice: '2.2' }
    ]
  };
  const actual = t.context.job._transformHashToArray(data);

  t.deepEqual(expected, actual);
});

test('init() returns config', async t => {
  const expected = {
    token: constants.file,
    permission: constants.scope,
    spreadsheetId: '<bank forex>',
    range: constants.read.range
  };

  const actual = await t.context.job.Worker.init(constants);

  t.deepEqual(expected, actual.config);
});

test('init() returns transform', async t => {
  const { job, sandbox } = t.context;

  const matrixToHash2 = { bind: sandbox.stub() };

  job.__set__('matrixToHash2', matrixToHash2);

  await job.Worker.init(constants);

  t.is(matrixToHash2.bind.callCount, 1);
  t.is(matrixToHash2.bind.calledWithExactly(constants.read.fields), true);
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
  const { job, sheetApiMock, bankForexMock } = t.context;
  const settings = {
    config: { },
    transform: () => {}
  };

  sheetApiMock
    .expects('read2')
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

  const count = await job.Worker.execute(settings);

  t.true(sheetApiMock.verify());
  t.true(bankForexMock.verify());
  t.is(count, 7);
});
