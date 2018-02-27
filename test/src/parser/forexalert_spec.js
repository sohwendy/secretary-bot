const test = require('ava');
const rewire = require('rewire');
const forex = rewire('../../../src/parser/forexalert');

const constantsMock = {
  forex: {
    title: 'foo',
    data: [
      { code: 'CCC', buyUnit: 1, sellUnit: 3 },
      { code: 'BBB', buyUnit: 5, sellUnit: 7 }
    ]
  }
};

forex.__set__('constants', constantsMock);


test('_stringify works', t => {
  const row = { code: 'ABC', buyRate: 3, sellRate: 4, sellUnit: 5, buyUnit: 6 };
  const expected = `${row.sellUnit} ${row.code} to ${row.sellRate} sgd   (${row.min}, ${row.max}) ${row.msg}`;
  const actual = forex._stringify(row);

  t.is(expected, actual);
});

test('_formatAlertJson works', t => {
  const row = [ 'ABC', 1.23, 4.56, '*', 'n', 5];
  const expected = { code: 'ABC', min: 1.23, max: 4.56, msg: '*', done: 'n', index: 0 };
  const actual = forex._formatAlertJson(row, 3);

  t.deepEqual(expected, actual);
});

const emptyRow = { code: 'ABC', buyRate: '-', sellRate: '-', buyUnit: '-', sellUnit: '-' };
test('_filter works', t => {
  const filter = forex._filter.bind({ factor: 2, data: { ABC: 1.5 } });
  const row = { code: 'ABC', buyRate: 1.23, sellRate: 4.56, buyUnit: 5, sellUnit: 1 };
  const expected = { code: 'ABC', buyRate: 3.75, sellRate: 1.334, buyUnit: 5, sellUnit: 1 };
  const actual = filter(row);

  t.deepEqual(expected, actual);
});

test('_filter returns empty row when code is invalid', t => {
  const filter = forex._filter.bind({ factor: 2, data: { DBC: 1.5 } });
  const row = { code: 'ABC', buyRate: 1.23, sellRate: 4.56, buyUnit: 5, sellUnit: 1 };
  const expected = emptyRow;
  const actual = filter(row);

  t.deepEqual(expected, actual);
});

test('_filter returns empty row when buyUnit is missing', t => {
  const filter = forex._filter.bind({ factor: 2, data: { ABC: 1.5 } });
  const row = { code: 'ABC', buyRate: 1.23, sellRate: 4.56, sellUnit: 1 };
  const expected = emptyRow;
  const actual = filter(row);

  t.deepEqual(expected, actual);
});

test('_filter returns empty row when sellUnit is missing', t => {
  const filter = forex._filter.bind({ factor: 2, data: { ABC: 1.5 } });
  const row = { code: 'ABC', buyRate: 1.23, sellRate: 4.56, buyUnit: 1 };
  const expected = emptyRow;
  const actual = filter(row);

  t.deepEqual(expected, actual);
});

test('_filter returns empty row when factor is missing', t => {
  const filter = forex._filter.bind({ data: { ABC: 1.5 } });
  const row = { code: 'ABC', buyRate: 1.23, sellRate: 4.56, buyUnit: 1 };
  const expected = emptyRow;
  const actual = filter(row);

  t.deepEqual(expected, actual);
});

// function _mergeAlert(triggers, t) {
//   const rateList = this;
//   const rate = rateList.find(r => r.code === t.code);
//   if (rate && rate.sellRate >= t.min && rate.sellRate < t.max && t.msg) {
//     triggers.push(Object.assign(t, rate));
//   }
//   return triggers;
// }

const rateList = [
  { code: 'CCC', buyRate: 3.75, sellRate: 1.334, buyUnit: 5, sellUnit: 1},
  { code: 'BBB', buyRate: 3.75, sellRate: 50, buyUnit: 5, sellUnit: 1},
];


const array = [
  { code: 'CCC', min: 10, max: 15, msg: '>', done: 'n', index: 0 },
  { code: 'CCC', min: 5, max: 15, msg: '>', done: 'n', index: 0 },
  { code: 'CCC', min: 3, max: 13, msg: '<', done: 'n', index: 0 },
  { code: 'BBB', min: 2, max: 12, msg: '>', done: 'n', index: 0 },
  { code: 'BBB', min: 3, max: 6, msg: '<', done: 'n', index: 0 },
];

test('_mergeAlert works', t => {
  const mergeAlert = forex._mergeAlert.bind(rateList);

  const expected = [{
    code: 'CCC',
    buyRate: 3.75,
    sellRate: 1.334,
    buyUnit: 5,
    sellUnit: 1,
    min: 1.23,
    max: 4.56,
    msg: '*',
    done: 'n',
    index: 0
  }];

  // const alertList = [
  //   {  code: 'CCC', min: 1.23, max: 4.56, msg: '*', done: 'n', index: 0 },
  //   {  code: 'CCC', min: 1.34, max: 1.35, msg: '*', done: 'n', index: 0 },
  //   {  code: 'CCC', min: 1.23, max: 4.56, msg: '*', done: 'n', index: 0 }
  // ];

  const row = { code: 'CCC', min: 1.23, max: 4.56, msg: '*', done: 'n', index: 0 };

  const actual = mergeAlert([], row);

  t.deepEqual(expected, actual);
});

test('_mergeAlert returns empty array when rate < min', t => {
  const expected = [];
  const row = { code: 'CCC', min: 3, max: 4.56, msg: '*', done: 'n', index: 0 };
  const mergeAlert = forex._mergeAlert.bind(rateList);
  const actual = mergeAlert([], row);

  t.deepEqual(expected, actual);
});

test('_mergeAlert returns empty array when msg is empty', t => {
  const expected = [];
  const row = { code: 'CCC', min: 1, max: 5, msg: '', done: 'n', index: 0 };
  const mergeAlert = forex._mergeAlert.bind(rateList);
  const actual = mergeAlert([], row);

  t.deepEqual(expected, actual);
});

test('_mergeAlert returns empty array when rate > max', t => {
  const expected = [];
  const row = { code: 'CCC', min: 1, max: 1.2, msg: '*', done: 'n', index: 0 };
  const mergeAlert = forex._mergeAlert.bind(rateList);
  const actual = mergeAlert([], row);

  t.deepEqual(expected, actual);
});

test('parse works', t => {
  const data = { BBB: 10, CCC: 20, SGD: 30 };
  const alert = [
    [ 'CCC', 1,  5, '*', 'n', 0 ],
    [ 'CCC', 6, 15, '*', 'n', 1 ]
  ];
  const expected = 'foo\n' +
    '\n' +
    '3 CCC to 4.5 sgd   (1, 5) *\n\n';
  const actual = forex.parse({ data, alert });

  t.is(expected, actual);
});

test('parse returns empty for missing data', t => {
  const alert = [
    [ 'CCC', 1,  5, '*', 'n', 0 ],
    [ 'CCC', 6, 15, '*', 'n', 1 ]
  ];
  const expected = '';
  const actual = forex.parse({ alert });

  t.is(expected, actual);
});

test('parse returns empty for empty data array', t => {
  const alert = [
    [ 'CCC', 1,  5, '*', 'n', 0 ],
    [ 'CCC', 6, 15, '*', 'n', 1 ]
  ];
  const expected = '';
  const actual = forex.parse({ data: [], alert });

  t.is(expected, actual);
});

test('parse returns empty for missing alert', t => {
  const data = { BBB: 10, CCC: 20, SGD: 30 };
  const expected = '';
  const actual = forex.parse({ data });

  t.is(expected, actual);
});

test('parse returns empty for empty alert array', t => {
  const data = { BBB: 10, CCC: 20, SGD: 30 };
  const expected = '';
  const actual = forex.parse({ data, alert: [] });

  t.is(expected, actual);
});

test('parse returns empty when no alert is found', t => {
  const data = { BBB: 10, CCC: 200, SGD: 30 };
  const alert = [
    [ 'CCC', 1,  5, '*', 'n', 0 ],
    [ 'CCC', 6, 15, '*', 'n', 1 ]
  ];
  const expected = '';
  const actual = forex.parse({ data, alert });

  t.is(expected, actual);
});
