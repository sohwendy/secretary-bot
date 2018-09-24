import test from 'ava';
import sinon from 'sinon';

const rewire = require('rewire');
const stub = require('../_stub');

const sheetApiMock = {
  read: () => {
    return [
      ['AA', '1', '3', '**'],
      ['BB', '2', '4', '']
    ];
  }
};
const rateApiMock = {
  get: () => {
    return { AA: 1, BB: 3, DD: 3, SGD: 5 };
  }
};

const row = { code: 'ZZ', buyUnit: 2.5, sellUnit: 500, buyRate: 1.789, sellRate: 7.93, done: 'n', watchlist: '*' };


let job;
let sandbox;
let constants;

test.beforeEach(() => {
  job = rewire('../../src/job/forex-report-job');
  job.__set__('SheetApi', sheetApiMock);
  job.__set__('RateApi', rateApiMock);

  sandbox = sinon.createSandbox();

  constants = require('../../config/constants');
  constants.secretPath = sandbox.stub().callsFake(stub.secretPath);
});

test.afterEach.always(() => {
  sandbox.restore();
});

test('stringify works', async t => {
  const expected = '2.5sgd  1.789zz   500zz   7.93sgd *';
  const actual = job._stringify(row);

  t.is(expected, actual);
});

test('fetch works', async t => {
  const expected = constants.forex.reportTitle +
    '\n' +
    '```\n' +
    '1sgd    0.2aa     3aa     15sgd **\n' +
    '2sgd    1.2bb     4bb  6.667sgd \n' +
    '```\n' +
    '[update ♧](<some_url>)';
  const actual = await job.fetch();

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  job.__set__('SheetApi', stub.exceptionMock);

  const expected = '';
  const actual = await job.fetch();

  t.is(expected, actual);
});
