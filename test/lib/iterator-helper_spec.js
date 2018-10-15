import test from 'ava';

const helper = require('../../src/lib/iterator-helper');

test('mergeHashUsingKey works', t => {
  const rule = { code: 'IBB', min: 1, max: 2 };
  const list = { IAA: 'foo', IBB: 'bar', ICC: 'baz' };
  const bind = helper.mergeHashUsingKey.bind(list);
  const actual = bind(rule);
  const expected = Object.assign(rule, list[1]);

  t.deepEqual(expected, actual);
});

test('mergeHashUsingKey returns nil if code is not found', t => {
  const rule = { code: 'IBB', min: 1, max: 2 };
  const list = { IAA: 'foo', ICC: 'bar' };
  const bind = helper.mergeHashUsingKey.bind(list);
  const actual = bind(rule);
  const expected = {};

  t.deepEqual(expected, actual);
});

test('mergeHashUsingKeyValue works', t => {
  const rule = { code: 'IBB', min: 1, max: 2 };
  const list = [
    { code: 'IAA', name: 'foo' },
    { code: 'IBB', name: 'bar' },
    { code: 'ICC', name: 'baz' }
  ];
  const bind = helper.mergeHashUsingKeyValue.bind(list);
  const actual = bind(rule);
  const expected = Object.assign(rule, list[1]);

  t.deepEqual(expected, actual);
});

test('mergeHashUsingKeyValue returns nil if code is not found', t => {
  const rule = { code: 'IDD', min: 1, max: 2 };
  const list = [
    { code: 'IAA', name: 'foo' },
    { code: 'IBB', name: 'bar' }
  ];
  const bind = helper.mergeHashUsingKeyValue.bind(list);
  const actual = bind(rule);
  const expected = {};

  t.deepEqual(expected, actual);
});

test('arrayToHash works', t => {
  const row = ['name', '0.5', 3, '08:00', '26 Feb 2018'];
  const params = ['stringN', 'float', 'number', 'time', 'date'];
  const expected = { stringN: 'name', float: 0.5, number: 3, time: '08:00', date: '26 Feb 2018' };
  const actual = helper.arrayToHash(row, params);

  t.deepEqual(expected, actual);
});

test('_chunkArray', t => {
  const row = ['A0', '', '', 'A1', '', '', 'A2', '', '' ];
  const expected = [['A0', '', ''], ['A1', '', ''], ['A2', '', '']];
  const actual = helper._chunkArray(row, 3);

  t.deepEqual(expected, actual);
});

test('_chunkToHash', t => {
  const row = [['A0', '', ''], ['A1', '', ''], ['A2', '', '']];
  const keys = ['id', '', ''];
  const expected = [{ id: 'A0' }, { id: 'A1' }, { id: 'A2' }];
  const actual = helper._chunkToHash(row, keys);

  t.deepEqual(expected, actual);
});

test('_combineRows', t => {
  const matrix = [
    [{ id: 'A0' }, { id: 'B0' }],
    [{ code: 'A1'}, { code: 'B1' }],
    [{ buyRate: 'A2', sellRate: 'A3'}, { buyRate: 'B2', sellRate: 'B3' }]
  ];
  const expected = [
    { id: 'A0', code: 'A1', buyRate: 'A2', sellRate: 'A3' },
    { id: 'B0', code: 'B1', buyRate: 'B2', sellRate: 'B3' }
  ];
  const actual = helper._combineRows(matrix);

  t.deepEqual(expected, actual);
});

test('matrixToHash works', t => {
  const expected = [
    { id: 'A0', code: 'A1', buyRate: 'A2', sellRate: 'A3' },
    { id: 'B0', code: 'B1', buyRate: 'B2', sellRate: 'B3' }
  ];

  const keys = [
    ['id', '', ''],
    ['code', '', ''],
    ['buyRate', 'sellRate', '']
  ];

  const matrix = [
    ['A0', '', '', 'B0', '', ''],
    ['A1', '', '', 'B1', '', ''],
    ['A2', 'A3', 'A4', 'B2', 'B3', 'B4']
  ];

  const actual = helper.matrixToHash(matrix, keys);
  t.deepEqual(expected, actual);
});


test('hashToMatrix works', t => {
  const expected = [
    ['r1-c0', 'r1-c2', 'r1-c3'],
    ['r2-c0', 'r2-c2', 'r2-c3']
  ];

  const keys = ['col0', 'col2', 'col3'];

  const hash = [
    { col0: 'r1-c0', col1: 'r1-c1', col2: 'r1-c2', col3: 'r1-c3' },
    { col0: 'r2-c0', col1: 'r2-c1', col2: 'r2-c2', col3: 'r2-c3' }
  ];

  const actual = helper.hashToMatrix(hash, keys);
  t.deepEqual(expected, actual);
});

test('hashToArray works', t => {
  const expected = ['r1-c0', 'r1-c2', 'r1-c3'];
  const keys = ['col0', 'col2', 'col3'];

  const hash = { col0: 'r1-c0', col1: 'r1-c1', col2: 'r1-c2', col3: 'r1-c3' };

  const actual = helper.hashToArray(hash, keys);

  t.deepEqual(expected, actual);
});
