import test from 'ava';

const rewire = require('rewire');
const constants = require('../../config/constants');

const sheetApiMock = {
  get: () => {
    return [
      ['AA', '1', '3', 'n'],
      ['BB', '2', '4', 'n']
    ];
  }
};
const rateApiMock = {
  get: () => {
    return {AA: 1, BB: 3, DD: 3, SGD: 5};
  }
};

const row = {code: 'ZZ', buyUnit: 2.5, sellUnit: 500, buyRate: 1.789, sellRate: 7.93, done: 'n'};

const exceptionMock = () => {
  throw 'this is an exception';
};

const log = () => {};

let job;
test.before(() => {
  job = rewire('../../src/job/forex-report-job');
  job.__set__('SheetApi', sheetApiMock);
  job.__set__('RateApi', rateApiMock);
});

test('stringify works', async t => {
  const expected = '2.5 sgdzz   1.789   500 zzsgd    7.93';
  const actual = job._stringify(row);

  t.is(expected, actual);
});

test('fetch works', async t => {
  const expected = constants.forex.reportTitle +
    '\n' +
    '```\n' +
    '1 sgdaa     0.2     3 aasgd      15\n' +
    '2 sgdbb     1.2     4 bbsgd   6.667\n' +
    '```\n' +
    '<some_link>';
  const actual = await job.fetch({log, fake: true});

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  job.__set__('SheetApi', exceptionMock);

  const expected = '';
  const actual = await job.fetch({log, fake: true});

  t.is(expected, actual);
});
