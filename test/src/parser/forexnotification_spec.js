const test = require('ava');
const rewire = require('rewire');
const forex = rewire('../../../src/parser/forexnotification');

const constantsMock = {
  forex: {
    title: 'foo',
    data: [
      { code: 'WEN', buyUnit: 1, sellUnit: 3 },
      { code: 'SOH', buyUnit: 5, sellUnit: 7 }
    ]
  }
};

forex.__set__('constants', constantsMock);

test('_stringify', t => {
  const row = { code: 'ABC', buyRate: 1.23, sellRate: 45.67, sellUnit: 100, buyUnit: 10 };
  const expected = `${row.buyUnit} sgd to abc   ${row.buyRate}    ${row.sellUnit} abc to sgd  ${row.sellRate}`;
  const actual = forex._stringify(row);

  t.is(expected, actual);
});

test('_filter works', t => {
  const row = { code: 'CBA', sellUnit: 100, buyUnit: 1000 };
  const expected = Object.assign(row, { code: 'CBA', buyRate: 131.3, sellRate: 761.615 });
  const filter = forex._filter.bind({ factor: 10, data: { CBA: 1.313 } });
  const actual = filter(row);

  t.deepEqual(expected, actual);
});

test('_filter returns 0 for invalid buyUnit', t => {
  const row = { code: 'CBA', sellUnit: 100 };
  const expected = { code: row.code, buyRate: '-', sellRate: '-', buyUnit: '-', sellUnit: '-' };
  const filter = forex._filter.bind({ factor: 10, data: { CBA: 1.313 } });
  const actual = filter(row);

  t.deepEqual(expected, actual);
});

test('_filter returns 0 for invalid sellUnit', t => {
  const row = { code: 'CBA', buyUnit: 100 };
  const expected = { code: row.code, buyRate: '-', sellRate: '-', buyUnit: '-', sellUnit: '-' };
  const filter = forex._filter.bind({ factor: 10, data: { CBA: 1.313 } });
  const actual = filter(row);

  t.deepEqual(expected, actual);
});

test('_filter returns 0 for invalid data code', t => {
  const row = { code: 'CBA', sellUnit: 100, buyUnit: 1000 };
  const expected = { code: row.code, buyRate: '-', sellRate: '-', buyUnit: '-', sellUnit: '-' };
  const filter = forex._filter.bind({ factor: 10, data: { DDD: 1.313 } });
  const actual = filter(row);

  t.deepEqual(expected, actual);
});

test('_parse works', t => {
  const data = { WEN: 1.01, SOH: 2.02, SGD: 3.03 };
  const expected = 'foo\n' +
    '\n' +
    '1 sgd to wen  0.333      3 wen to sgd      9\n' +
    '5 sgd to soh  3.333      7 soh to sgd   10.5';
  const actual = forex.parse({ data });

  t.is(expected, actual);
});

test('_parse returns nil for empty data', t => {
  const expected = '';
  const actual = forex.parse({ });
  t.is(expected, actual);
});

test('_parse returns nil for empty data array', t => {
  const expected = '';
  const actual = forex.parse({ data: [] });
  t.is(expected, actual);
});
