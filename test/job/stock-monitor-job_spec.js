import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');
const constants = require('../../config/constants').stock;

const codeData = [
  { code: 'GLD',    name: 'gold',    suffix: 'CUR', short: 'GLD' },
  { code: 'A01.SI', name: 'Stock A', suffix: 'SI',  short: 'A01' },
  { code: 'B02.SI', name: 'Stock B', suffix: 'SI',  short: 'B02' }
];
const ruleData = [
  { name: 'stock a', code: 'A01.SI', min: 1,     max: 3,  message: 'no',  done: 'n' },
  { name: 'ddd',     code: 'DDD',    min: 3,     max: 4,  message: 'no',  done: 'n' },
  { name: 'stock a', code: 'A01.SI', min: 4,     max: 11, message: 'yes', done: 'n' },
  { name: 'stock a', code: 'A01.SI', min: 10.5,  max: 12, message: 'no',  done: 'n' },
];
const stockData = [
  { code: 'GLD',    name: 'gold',    price: 5, changeAmount: '+0.1' },
  { code: 'A01.SI', name: 'Stock A', price: 10, changeAmount: '+0.5' },
  { code: 'B02.SI', name: 'Stock B', price: 1, changeAmount: '-0.1' }
];

test.beforeEach(t => {
  t.context.job = rewire('../../src/job/stock-monitor-job');
  t.context.sandbox = sinon.createSandbox();

  const { job } = t.context;

  constants.file =  './sample/google.json';
  constants.secretFile =  './sample/stock.json';
  job.__set__('constants', constants);
});

test.afterEach.always(t => {
  t.context.sandbox.restore();
});

const row = { code: 'AA', name: 'apple', price: 5.5, min: 3, max: 6.4, message: 'msg', short: 'A' };

test('rule works', async t => {
  const expected = true;
  const actual = t.context.job._rule(row);

  t.is(expected, actual);
});

test('rule returns false for > max value', async t => {
  const expected = false;
  const newRow = Object.assign({}, row);
  newRow.max = 3;
  const actual = t.context.job._rule(newRow);

  t.is(expected, actual);
});

test('rule returns false for < min value', async t => {
  const expected = false;
  const newRow = Object.assign({}, row);
  newRow.min = 7.99;
  const actual = t.context.job._rule(newRow);

  t.is(expected, actual);
});

test('rule returns false for done = Y', async t => {
  const expected = false;
  const newRow = Object.assign({}, row);
  newRow.done = 'Y';
  const actual = t.context.job._rule(newRow);

  t.is(expected, actual);
});


test('init() returns config', async t => {
  const expected = {
    title: constants.monitorTitle,
    key: '<alpha_vantage_key_2>',
    code: {
      token: './sample/google.json',
      permission: [ 'https://www.googleapis.com/auth/spreadsheets.readonly' ],
      spreadsheetId: '<stock_sheet_id>',
      range: 'StockCode!A2:D'
    },
    rule: {
      token: './sample/google.json',
      permission: [ 'https://www.googleapis.com/auth/spreadsheets.readonly' ],
      spreadsheetId: '<stock_sheet_id>',
      range: 'StockRule!B2:G'
    }
  };

  const actual = await t.context.job.Worker.init(constants);

  t.deepEqual(expected, actual.config);
});

test('init() returns transform', async t => {
  const { job, sandbox } = t.context;

  const arrayToHash2 = { bind: sandbox.stub() };

  job.__set__('arrayToHash2', arrayToHash2);

  await job.Worker.init(constants);

  t.is(arrayToHash2.bind.callCount, 2);
  t.is(arrayToHash2.bind.calledWithExactly(constants.code.fields), true);
  t.is(arrayToHash2.bind.calledWithExactly(constants.rule.fields), true);
});

test('execute() works', async t => {
  const { job, sandbox } = t.context;
  const settings = {
    config: {
      key: 'key',
      code: 'code',
      rule: 'rule'
    },
    transform: { code: () => {}, rule: () => {} },
  };

  const sheetApiStub = sandbox.stub();
  sheetApiStub
    .withArgs('code', settings.transform.code).returns(Promise.resolve(codeData))
    .withArgs('rule', settings.transform.rule).returns(Promise.resolve(ruleData));
  job.__set__('SheetApi', { read: sheetApiStub });

  const stockApiStub = sandbox.stub();
  stockApiStub
    .withArgs('key', 'GLD', 0).returns(Promise.resolve(stockData[0]))
    .withArgs('key', 'A01.SI', 15000).returns(Promise.resolve(stockData[1]))
    .withArgs('key', 'B02.SI', 30000).returns(Promise.resolve(stockData[2]));
  job.__set__('StockApi', { get: stockApiStub });

  const expected = ['A01     10       4-11  Stock A yes'];

  const actual = await job.Worker.execute(settings);

  t.deepEqual(expected, actual);
});

const list = ['A01     10       4-11  Stock A yes'];

test('fetch works', async t => {
  const expected = constants.monitorTitle +
    '\n' +
    '```\n' +
    list.join('\n') +
    '\n' +
    '```\n';

  const { sandbox, job } = t.context;
  sandbox.stub(job.Worker, 'init').returns({
    config: {
      title: constants.monitorTitle
    }
  });
  sandbox.stub(job.Worker, 'execute').returns(list);

  const actual = await t.context.job.fetch();

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  const expected = '';
  const actual = await t.context.job.fetch();

  t.is(expected, actual);
});

