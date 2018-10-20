import test from 'ava';
import sinon from 'sinon';
const constants = require('../../config/constants').forex;
const SheetApi = require('../../src/utility/google-sheet-api');
const RateApi = require('../../src/utility/open-exchange-rate-api');
const rewire = require('rewire');

const codeData = [
  { code: 'AUD', buyUnit: '1', sellUnit: '3', watchlist: '*', mca: ''},
  { code: 'INR', buyUnit: '2', sellUnit: '4', watchlist: '',  mca: ''}
];

const ruleData = [
  { code: 'INR', buysell: 'S', min: '0.1', max: '0.2', message: 'no', done: 'N' },
  { code: 'INR', buysell: 'S', min: '5',   max: '8',   message: 'yes', done: 'N' },
  { code: 'INR', buysell: 'S', min: '7.8', max: '8',   message: 'yes', done: 'N' },
  { code: 'INR', buysell: 'S', min: '90',  max: '100', message: 'no', done: 'N' }
];
const rateData = [
  { code: 'AUD', price: 1 },
  { code: 'BB', price: 3 },
  { code: 'INR', price: 30 },
  { code: 'SGD', price: 5 }
];

const row = {
  code: 'INR',
  buyUnit: 2.5,
  sellUnit: 500,
  buyRate: 1.789,
  sellRate: 7.93,
  buysell: 'S',
  min: 1,
  max: 8,
  message: 'some_msg',
  done: 'N',
  watchlist: '*'
};

test.beforeEach(t => {
  t.context.worker = rewire('../../src/worker/forex-monitor-worker');
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

test('rule works', async t => {
  const expected = true;
  const actual = t.context.worker._rule(row);

  t.is(expected, actual);
});

test('rule returns false for > max value', async t => {
  const expected = false;
  let newRow = {};
  Object.assign(newRow, row);
  newRow.max = 3;
  const actual = t.context.worker._rule(newRow);

  t.is(expected, actual);
});

test('rule returns true for buy', async t => {
  const expected = true;
  const newRow = Object.assign({}, row);
  newRow.buysell = 'B';
  const actual = t.context.worker._rule(newRow);

  t.is(expected, actual);
});

test('rule returns false for < min value', async t => {
  const expected = false;
  const newRow = Object.assign({}, row);
  newRow.min = 7.99;
  const actual = t.context.worker._rule(newRow);

  t.is(expected, actual);
});

test('rule returns false for done = Y', async t => {
  const expected = false;
  const newRow = Object.assign({}, row);
  newRow.done = 'Y';
  const actual = t.context.worker._rule(newRow);

  t.is(expected, actual);
});

test('stringify works', async t => {
  const expected = '2.5sgd  1.789inr    500inr   7.93sgd\n' +
    '  *  (1, 8)   some_msg';
  const actual = t.context.worker._stringify(row);

  t.is(expected, actual);
});

test('init() returns config', async t => {
  const expected = {
    title: '🌎🔥 Left - more is gd, Right - less is gd...',
    rateKey: '<oer_key>',
    rule: {
      token: './sample/google.json',
      permission: [ 'https://www.googleapis.com/auth/spreadsheets.readonly' ],
      spreadsheetId: '<forex_sheet_id>',
      range: 'ForexRule!B2:G'
    },
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

  t.is(arrayToHash.bind.callCount, 2);
  t.is(arrayToHash.bind.calledWithExactly(constants.code.fields), true);
  t.is(arrayToHash.bind.calledWithExactly(constants.rule.fields), true);
});

test('execute() works', async t => {
  const { worker, sheetApiMock, rateApiMock } = t.context;
  const settings = {
    config: {
      rateKey: 'rateKey',
      code: 'code',
      rule: 'rule'
    },
    transformRule: () => {},
    transformCode: () => {},
  };

  const expected = ['2sgd     15inr    4inr  0.134sgd\n    (0.1, 0.2)   no'];

  rateApiMock
    .expects('get')
    .withExactArgs({key: 'rateKey'})
    .once()
    .returns(rateData);

  sheetApiMock
    .expects('read')
    .withExactArgs('code', settings.transformCode)
    .once()
    .returns(codeData);

  sheetApiMock
    .expects('read')
    .withExactArgs('rule',  settings.transformRule)
    .once()
    .returns(ruleData);

  const actual = await worker.execute(settings);

  t.true(sheetApiMock.verify());
  t.true(rateApiMock.verify());
  t.deepEqual(expected, actual);
});
