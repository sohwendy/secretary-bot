import test from 'ava';

const rewire = require('rewire');
const constants = require('../../config/constants');


const codeMock = [
  ['AA', '1', '3', '*', 'mca'],
  ['ZZ', '2', '4', '', '']
];
const ruleMock = [
  ['ZZ', '0.1', '0.2', 'no', 'n'],
  ['ZZ', '5', '8', 'yes', 'y'],
  ['ZZ', '7.8', '8', 'yes', 'n'],
  ['ZZ', '90', '100', 'no', 'n']
];
const rateMock = { AA: 1, BB: 3, ZZ: 3, SGD: 5 };

const row = {
  code: 'ZZ',
  buyUnit: 2.5,
  sellUnit: 500,
  buyRate: 1.789,
  sellRate: 7.93,
  min: 1,
  max: 8,
  message: 'some_msg',
  done: 'n',
  watchlist: '*'
};

const sheetApiMock = {
  get: (_a, _b, options) => {
    return options.range === 'ForexCode!B2:F' ? codeMock : ruleMock;
  }
};

const rateApiMock = { get: () => rateMock };
const exceptionMock = () => { throw 'this is an exception';};

let job;
test.beforeEach(() => {
  job = rewire('../../src/job/forex-monitor-job');
  job.__set__('SheetApi', sheetApiMock);
  job.__set__('RateApi', rateApiMock);
});

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

test('stringify works', async t => {
  const expected = '500 ZZ to 7.93 sgd   (1, 8) some_msg  *';
  const actual = job._stringify(row);

  t.is(expected, actual);
});

test('fetch works', async t => {
  const expected = constants.forex.monitorTitle +
    '\n' +
    '```\n' +
    '4 ZZ to 6.667 sgd   (5, 8) yes  \n' +
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
