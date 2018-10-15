import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');
const stub = require('../_stub');

const codeMock = [
  { code: 'GLD',    name: 'gold',    suffix: 'CUR', short: 'GLD' },
  { code: 'A01.SI', name: 'Stock A', suffix: 'SI',  short: 'A01' },
  { code: 'B02.SI', name: 'Stock B', suffix: 'SI',  short: 'B02' }
];
const ruleMock = [
  { name: 'stock a', code: 'A01.SI', min: 1,     max: 3,  message: 'no',  done: 'n' },
  { name: 'ddd',     code: 'DDD',    min: 3,     max: 4,  message: 'no',  done: 'n' },
  { name: 'stock a', code: 'A01.SI', min: 4,     max: 11, message: 'yes', done: 'n' },
  { name: 'stock a', code: 'A01.SI', min: 10.5,  max: 12, message: 'no',  done: 'n' },
];
const sheetApiMock = {
  read: (_a, _b, options, _c) => {
    return options.range === 'StockCode!A2:D' ? codeMock : ruleMock;
  }
};

const stockApiMock = {
  get: (key, code, _time) => {
    return { code, name: 'a name', price: 10, changeAmount: 'amt' };
  }
};

let job;
let sandbox;
let constants;

test.beforeEach(() => {
  job = rewire('../../src/job/stock-monitor-job');
  job.__set__('SheetApi', sheetApiMock);
  job.__set__('StockApi', stockApiMock);

  sandbox = sinon.createSandbox();

  constants = require('../../config/constants');
});

test.afterEach.always(() => {
  sandbox.restore();
});

test('stringify works', async t => {
  const expected = 'AA      1  0.345-0.555    apple msg';
  const actual = job._stringify({ short: 'AA', name: 'apple', price: 1, min: 0.345, max: 0.555, message: 'msg' });

  t.is(expected, actual);
});

const row = { code: 'AA', name: 'apple', price: 5.5, min: 3, max: 6.4, message: 'msg', short: 'A' };

test('rule works', async t => {
  const expected = true;
  const actual = job._rule(row);

  t.is(expected, actual);
});

test('rule returns false for > max value', async t => {
  const expected = false;
  const newRow = Object.assign({}, row);
  newRow.max = 3;
  const actual = job._rule(newRow);

  t.is(expected, actual);
});

test('rule returns false for < min value', async t => {
  const expected = false;
  const newRow = Object.assign({}, row);
  newRow.min = 7.99;
  const actual = job._rule(newRow);

  t.is(expected, actual);
});

test('rule returns false for done = Y', async t => {
  const expected = false;
  const newRow = Object.assign({}, row);
  newRow.done = 'Y';
  const actual = job._rule(newRow);

  t.is(expected, actual);
});

test('fetch works', async t => {
  const expected = constants.stock.monitorTitle +
    '\n' +
    '```\n' +
    'A01     10       4-11   a name yes\n' +
    '```\n';
  const actual = await job.fetch();

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  job.__set__('SheetApi', stub.exceptionMock);

  const expected = '';
  const actual = await job.fetch();

  t.is(expected, actual);
});
