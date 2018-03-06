import test from 'ava';

const rewire = require('rewire');
const constants = require('../../config/constants');


const sheetApiMock = {
  get: () => {
    return [
      ['AAA', 'a name', 'io'],
      ['BBB', 'b name', 'co'],
      ['CCC', 'c name', 'tv']
    ];
  }
};
const stockApiMock = {
  get: (code, _suffix) => {
    return { code, name: 'a name', price: 1, changeAmount: 'date' };
  }
};
const exceptionMock = () => { throw 'this is an exception'; };
const log = () => {};

let job;
test.beforeEach(() => {
  job = rewire('../../src/job/stock-report-job');
  job.__set__('SheetApi', sheetApiMock);
  job.__set__('StockApi', stockApiMock);
});

test('stringify works', async t => {
  const expected = 'AA      1   date  apple';
  const actual = job._stringify({ code: 'AA', name: 'apple', price: 1, changeAmount: 'date' });

  t.is(expected, actual);
});

test('fetch works', async t => {
  const expected = constants.stock.reportTitle + '\n' +
    '```\n' +
    'AAA      1   date  a name\n' +
    'BBB      1   date  a name\n' +
    'CCC      1   date  a name\n' +
    '```\n' +
    '[update ♧](<some_url>)';
  const actual = await job.fetch({ log, fake: true });

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  job.__set__('SheetApi', exceptionMock);

  const expected = '';
  const actual = await job.fetch({ log, fake: true });

  t.is(expected, actual);
});
