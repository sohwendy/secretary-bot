import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');
const stub = require('../_stub');

const codeMock = [
  { code: 'AUD', buyUnit: '1', sellUnit: '3', watchlist: '*', mca: ''},
  { code: 'INR', buyUnit: '2', sellUnit: '4', watchlist: '',  mca: ''}
];
const ruleMock = [
  { code: 'INR', buysell: 'S', min: '0.1', max: '0.2', message: 'no', done: 'N' },
  { code: 'INR', buysell: 'S', min: '5',   max: '8',   message: 'yes', done: 'N' },
  { code: 'INR', buysell: 'S', min: '7.8', max: '8',   message: 'yes', done: 'N' },
  { code: 'INR', buysell: 'S', min: '90',  max: '100', message: 'no', done: 'N' }
];
const rateMock = { AUD: 1, BB: 3, INR: 3, SGD: 5 };

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

const sheetApiMock = {
  read: (_a, _b, options) => {
    return options.range === 'ForexCode!B2:F' ? codeMock : ruleMock;
  }
};

const rateApiMock = { get: () => rateMock };

let job;
let sandbox;
let constants;

test.beforeEach(() => {
  job = rewire('../../src/job/forex-monitor-job');
  job.__set__('SheetApi', sheetApiMock);
  job.__set__('RateApi', rateApiMock);

  sandbox = sinon.createSandbox();

  constants = require('../../config/constants');
  constants.secretPath = sandbox.stub().callsFake(stub.secretPath);
});

test.afterEach.always(() => {
  sandbox.restore();
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

test('rule returns false for done = Y', async t => {
  const expected = false;
  const newRow = Object.assign({}, row);
  newRow.done = 'Y';
  const actual = job._rule(newRow);

  t.is(expected, actual);
});

test('stringify works', async t => {
  const expected = '2.5sgd  1.789inr    500inr   7.93sgd\n' +
    '  *  (1, 8)   some_msg';
  const actual = job._stringify(row);

  t.is(expected, actual);
});

test('fetch works', async t => {
  const expected = constants.forex.monitorTitle +
    '\n' +
    '```\n' +
    '2sgd    1.2inr    4inr  6.667sgd' +
    '\n' +
    '    (5, 8)   yes' +
    '\n' +
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
