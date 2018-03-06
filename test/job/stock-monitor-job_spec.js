import test from 'ava';

const rewire = require('rewire');
const constants = require('../../config/constants');


const codeMock = [
  ['AAA', 'a name', 'io'],
  ['BBB', 'b name', 'co'],
  ['CCC', 'c name', 'tv']
];
const ruleMock = [['bbb', 'BBB', 1, 3, 'no', 'n'],
  ['ddd', 'DDD', 3, 4, 'no', 'n'],
  ['bbb', 'BBB', 4, 11, 'yes', 'n'],
  ['bbb', 'BBB', 10.5, 12, 'no', 'n']
];
const sheetApiMock = {
  get: (_a, _b, options, _c) => {
    return options.range === 'StockCode!A2:C' ? codeMock : ruleMock;
  }
};

const stockApiMock = {
  get: (code) => {
    return { code, name: 'a name', price: 10, changeAmount: 'date' };
  }
};
const exceptionMock = () => { throw 'this is an exception'; };

let job;
test.beforeEach(() => {
  job = rewire('../../src/job/stock-monitor-job');
  job.__set__('SheetApi', sheetApiMock);
  job.__set__('StockApi', stockApiMock);
});

test('stringify works', async t => {
  const expected = 'AA      1  0.345-0.555  apple  msg';
  const actual = job._stringify({ code: 'AA', name: 'apple', price: 1, min: 0.345, max: 0.555, message: 'msg' });

  t.is(expected, actual);
});

const row = { code: 'AA', name: 'apple', price: 5.5, min: 3, max: 6.4, message: 'msg' };

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

test('rule returns false for no message', async t => {
  const expected = false;
  const newRow = Object.assign({}, row);
  newRow.message = '';
  const actual = job._rule(newRow);

  t.is(expected, actual);
});

test('fetch works', async t => {
  const expected = constants.stock.monitorTitle +
    '\n' +
    '```\n' +
    'BBB     10     4-11 a name  yes\n' +
    '```\n';
  const actual = await job.fetch({ fake: true });

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  job.__set__('SheetApi', exceptionMock);

  const expected = '';
  const actual = await job.fetch({ fake: true });

  t.is(expected, actual);
});
