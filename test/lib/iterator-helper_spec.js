import test from 'ava';

const helper = require('../../src/lib/iterator-helper');


test('rowToHash works', t => {
  const row = ['name', '0.5', 3, '08:00', '26 Feb 2018'];
  const params = ['stringN', 'float', 'number', 'time', 'date'];
  const expected = { stringN: 'name', float: 0.5, number: 3, time: '08:00', date: '26 Feb 2018' };
  const actual = helper.rowToHash(row, params);

  t.deepEqual(expected, actual);
});

test('arrayToHash2 works', t => {
  const row = [
    ['name1', '0.5', 3, '08:00', '26 Feb 2018'],
    ['name2', '0.5', 3, '08:00', '26 Feb 2018']
  ];
  const params = ['stringN', 'float', 'number', 'time', 'date'];
  const expected = [
    { stringN: 'name1', float: 0.5, number: 3, time: '08:00', date: '26 Feb 2018' },
    { stringN: 'name2', float: 0.5, number: 3, time: '08:00', date: '26 Feb 2018' }
  ];
  const bind = helper.arrayToHash2.bind(params);
  const actual = bind(row);

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

test('matrixToHash2 works', t => {
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

  const bind = helper.matrixToHash2.bind(keys);
  const actual = bind(matrix);
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


test('leftJoin works with default code', t => {
  const left = [
    { code: 'AUD', price: 1.1 },
    { code: 'ZZZ', price: 1.2 },
    { code: 'JPY', price: 1.3 },
  ];

  const right = [{
    code: 'AUD',
    buyUnit: 1,
    sellUnit: 1,
  }, {
    code: 'JPY',
    buyUnit: 1,
    sellUnit: 100,
  }];

  const expected = [{
    code: 'AUD',
    buyUnit: 1,
    sellUnit: 1,
    price: 1.1
  }, {
    code: 'JPY',
    buyUnit: 1,
    sellUnit: 100,
    price: 1.3
  }];

  const actual = helper.leftJoin(left, right);
  t.deepEqual(expected, actual);
});


test('leftJoin works with key', t => {
  const left = [
    { key: 'AUD', price: 1.1 },
    { key: 'ZZZ', price: 1.2 },
    { key: 'JPY', price: 1.3 },
  ];

  const right = [{
    key: 'AUD',
    buyUnit: 1,
    sellUnit: 1,
  }, {
    key: 'JPY',
    buyUnit: 1,
    sellUnit: 100,
  }];

  const expected = [{
    key: 'AUD',
    buyUnit: 1,
    sellUnit: 1,
    price: 1.1
  }, {
    key: 'JPY',
    buyUnit: 1,
    sellUnit: 100,
    price: 1.3
  }];

  const actual = helper.leftJoin(left, right, 'key');
  t.deepEqual(expected, actual);
});
