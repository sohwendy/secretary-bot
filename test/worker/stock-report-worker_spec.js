import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');
const constants = require('../../config/constants').stock;
const SheetApi = require('../../src/utility/google-sheet-api');

const sheetData = [
  { code: 'GLD',    name: 'gold',    suffix: 'CUR', short: 'GLD' },
  { code: 'A01.SI', name: 'Stock A', suffix: 'SI',  short: 'A01' },
  { code: 'B02.SI', name: 'Stock B', suffix: 'SI',  short: 'B02' }
];

const stockData = [
  { code: 'GLD', price: '115.2300', changeAmount: '-0.5500' },
  { code: 'A01.SI', price: '2.5000', changeAmount: '0.0100' },
  { code: 'C02.SI', price: '6.8600', changeAmount: '-0.0400' }
];

test.beforeEach(t => {
  t.context.worker = rewire('../../src/worker/stock-report-worker');
  t.context.sandbox = sinon.createSandbox();

  const { worker, sandbox } = t.context;

  t.context.sheetApiMock  = sandbox.mock(SheetApi);

  const stockApiStub = sandbox.stub();
  stockApiStub
    .withArgs('key', 'GLD', 0).returns(Promise.resolve(stockData[0]))
    .withArgs('key', 'A01.SI', 15000).returns(Promise.resolve(stockData[1]))
    .withArgs('key', 'B02.SI', 30000).returns(Promise.resolve(stockData[2]));
  worker.__set__('StockApi', { get: stockApiStub });

  constants.file =  './sample/google.json';
  constants.secretFile =  './sample/stock.json';
  worker.__set__('constants', constants);
});

test.afterEach.always(t => {
  t.context.sandbox.restore();
});

test('stringify works', async t => {
  const expected = '  AA      1    0.3  apple';
  const actual = t.context.worker._stringify({ short: 'AA', name: 'apple', price: 1, changeAmount: '0.3' });

  t.is(expected, actual);
});

test('init() returns config', async t => {
  const expected = {
    title: constants.reportTitle,
    key: '<alpha_vantage_key_1>',
    code: {
      token: './sample/google.json',
      permission: [ 'https://www.googleapis.com/auth/spreadsheets.readonly' ],
      spreadsheetId: '<stock_sheet_id>',
      range: 'StockCode!A2:D'
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
  const { worker, sheetApiMock } = t.context;
  const settings = {
    key: 'key',
    config: { code: 'code' },
    transform: () => {},
  };

  const expected = [
    ' GLD 115.23  -0.55  gold',
    ' A01    2.5   0.01  Stock A'
  ];

  sheetApiMock
    .expects('read')
    .withExactArgs('code', settings.transform)
    .once()
    .returns(sheetData);

  const actual = await worker.execute(settings);

  t.true(sheetApiMock.verify());
  t.deepEqual(expected, actual);
});
