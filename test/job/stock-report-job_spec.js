import test from 'ava';
import sinon from 'sinon';

const rewire = require('rewire');
const stub = require('../_stub');

const sheetApiMock = {
  get: () => {
    return [
      ['AAA', 'a name', 'io', 'A'],
      ['BBB', 'b name', 'co', 'B'],
      ['CCC', 'c name', 'tv', 'C']
    ];
  }
};
const stockApiMock = {
  get: (key, code, _suffix, _time) => {
    return { code, name: 'a name', price: 1, changeAmount: 'amt' };
  }
};
const exceptionMock = () => { throw 'this is an exception'; };

let job;
let sandbox;
let constants;

test.beforeEach(() => {
  job = rewire('../../src/job/stock-report-job');
  job.__set__('SheetApi', sheetApiMock);
  job.__set__('StockApi', stockApiMock);

  sandbox = sinon.createSandbox();

  constants = require('../../config/constants');
  constants.secretPath = sandbox.stub().callsFake(stub.secretPath);
});

test.afterEach.always(() => {
  sandbox.restore();
});

test('stringify works', async t => {
  const expected = 'AA      1    amt  apple';
  const actual = job._stringify({ short: 'AA', name: 'apple', price: 1, changeAmount: 'amt' });

  t.is(expected, actual);
});

test('fetch works', async t => {
  const expected = constants.stock.reportTitle + '\n' +
    '```\n' +
    'A      1    amt  a name\n' +
    'B      1    amt  a name\n' +
    'C      1    amt  a name\n' +
    '```\n' +
    '[update ♧](<some_url>)';
  const actual = await job.fetch();

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  job.__set__('SheetApi', exceptionMock);

  const expected = '';
  const actual = await job.fetch();

  t.is(expected, actual);
});
