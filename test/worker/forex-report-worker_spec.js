import test from 'ava';
import sinon from 'sinon';
const constants = require('../../config/constants').forex;
const SheetApi = require('../../src/utility/google-sheet-api');
const RateApi = require('../../src/utility/open-exchange-rate-api');
const rewire = require('rewire');

const rateData = [
  { code: 'MYR', price: 1 },
  { code: 'CNY', price: 3 },
  { code: 'DD',  price: 3 },
  { code: 'SGD', price: 5 }
];
const codeData = [
  { code: 'MYR', buyUnit: '1', sellUnit: '3', watchlist: '**', mca: '' },
  { code: 'CNY', buyUnit: '2', sellUnit: '4', watchlist: '',   mca: '' }
];
const row = { code: 'AUD', buyUnit: 2.5, sellUnit: 500, buyRate: 1.789, sellRate: 7.93, done: 'n', watchlist: '*' };

test.beforeEach(t => {
  t.context.worker = rewire('../../src/worker/forex-report-worker');
  t.context.sandbox = sinon.createSandbox();

  const { worker, sandbox } = t.context;

  t.context.sheetApiMock  = sandbox.mock(SheetApi);
  t.context.rateApiMock  = sandbox.mock(RateApi);

  constants.file =  './sample/google.json';
  constants.rateSecretFile =  './sample/oer.json';
  constants.secretFile =  './sample/forex.json';
  worker.__set__('constants', constants);
});

test.afterEach.always(t => {
  t.context.sandbox.restore();
});

test('stringify works', async t => {
  const expected = '2.5sgd  1.789aud   500aud   7.93sgd *';
  const actual = t.context.worker._stringify(row);

  t.is(expected, actual);
});

test('init() returns config', async t => {
  const expected = {
    title: '🌎 Left - more is gd, Right - less is gd...',
    rateKey: '<oer_key>',
    code: {
      token: './sample/google.json',
      permission: [ 'https://www.googleapis.com/auth/spreadsheets.readonly' ],
      spreadsheetId: '<forex_sheet_id>',
      range: 'ForexCode!B2:F'
    }
  };

  const actual = await t.context.worker.init(constants);

  t.deepEqual(expected, actual.config);
});

test('init() returns transform', async t => {
  const { worker, sandbox } = t.context;

  const arrayToHash = { bind: sandbox.stub() };

  worker.__set__('arrayToHash', arrayToHash);

  await worker.init(constants);

  t.is(arrayToHash.bind.callCount, 1);
  t.is(arrayToHash.bind.calledWithExactly(constants.code.fields), true);
});

test('execute() works', async t => {
  const { worker, sheetApiMock, rateApiMock } = t.context;
  const settings = {
    config: {
      rateKey: 'rateKey',
      code: 'code',
      rule: 'rule'
    },
    transform: () => {},
  };

  const expected = [
    '1sgd      1myr     3myr      3sgd **',
    '2sgd    1.5cny     4cny  1.334sgd '
  ];

  rateApiMock
    .expects('get')
    .withExactArgs({key: 'rateKey'})
    .once()
    .returns(rateData);

  sheetApiMock
    .expects('read')
    .withExactArgs('code', settings.transform)
    .once()
    .returns(codeData);

  const actual = await worker.execute(settings);

  t.true(sheetApiMock.verify());
  t.true(rateApiMock.verify());
  t.deepEqual(expected, actual);
});
