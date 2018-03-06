import test from 'ava';

const helper = require('../../src/lib/iterator-helper');

test('mergeJsonUsingKey works', t => {
  const rule = { code: 'IBB', min: 1, max: 2 };
  const list = { IAA: 'foo', IBB: 'bar', ICC: 'baz' };
  const bind = helper.mergeJsonUsingKey.bind(list);
  const actual = bind(rule);
  const expected = Object.assign(rule, list[1]);

  t.deepEqual(expected, actual);
});

test('mergeJsonUsingKey returns nil if code is not found', t => {
  const rule = { code: 'IBB', min: 1, max: 2 };
  const list = { IAA: 'foo', ICC: 'bar' };
  const bind = helper.mergeJsonUsingKey.bind(list);
  const actual = bind(rule);
  const expected = {};

  t.deepEqual(expected, actual);
});

test('mergeJsonUsingKeyValue works', t => {
  const rule = { code: 'IBB', min: 1, max: 2 };
  const list = [
    { code: 'IAA', name: 'foo' },
    { code: 'IBB', name: 'bar' },
    { code: 'ICC', name: 'baz' }
  ];
  const bind = helper.mergeJsonUsingKeyValue.bind(list);
  const actual = bind(rule);
  const expected = Object.assign(rule, list[1]);

  t.deepEqual(expected, actual);
});

test('mergeJsonUsingKeyValue returns nil if code is not found', t => {
  const rule = { code: 'IDD', min: 1, max: 2 };
  const list = [
    { code: 'IAA', name: 'foo' },
    { code: 'IBB', name: 'bar' }
  ];
  const bind = helper.mergeJsonUsingKeyValue.bind(list);
  const actual = bind(rule);
  const expected = {};

  t.deepEqual(expected, actual);
});

test('toJson works', t => {
  const row = ['name', '0.5', 3, '08:00', '26 Feb 2018'];
  const params = ['stringN', 'float', 'number', 'time', 'date'];
  const expected = { stringN: 'name', float: 0.5, number: 3, time: '08:00', date: '26 Feb 2018' };
  const actual = helper.toJson(row, params);

  t.deepEqual(expected, actual);
});
