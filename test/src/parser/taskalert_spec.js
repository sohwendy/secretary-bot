const test = require('ava');
const mockdate = require('mockdate');
const moment = require('moment');
const alert = require('../../../src/parser/taskalert');

const data = [
  [ '02 Mar 2018', '18:15:00', 'no', 'empty'],
  [ '03 Mar 2018', '17:59:00', 'no', 'empty'],
  [ '03 Mar 2018', '18:00:00', 'a', 'first a'],
  [ '03 Mar 2018', '18:10:00', 'a', 'second a'],
  [ '03 Mar 2018', '18:15:00', 'a', 'third a'],
  [ '03 Mar 2018', '18:16:00', 'no', 'empty'],
  [ '04 Mar 2018', '18:00:00', 'no', 'empty'],
];

const list = [
  { type: 'a', title: 'first a' },
  { type: 'a', title: 'second a'},
  { type: 'a', title: 'third a'}
];

mockdate.set(moment('03 Mar 2018 18:00:00', 'DD MMM YYYY HH:mm:ss'));

test('_stringify', t => {
  const expected = 'a   first a\na   second a\na   third a\n';
  const actual = alert._stringify(list);
  t.deepEqual(expected, actual);
});

test('_filter returns false for event before now()', t => {
  const today = moment();
  const filter = alert._filter.bind(today);
  const actual = filter(data[1]);

  t.deepEqual(false, actual);
});

test('_filter returns false for event after now()', t => {
  const today = moment();
  const filter = alert._filter.bind(today);
  const actual = filter(data[5]);

  t.deepEqual(false, actual);
});

test('_filter returns true', t => {
  const today = moment();
  const filter = alert._filter.bind(today);
  const actual = filter(data[3]);

  t.deepEqual(true, actual);
});

test('parse() with link', t => {
  const link = 'some link';
  const expected = '♫ Get Ready... 3\n' +
    'a   first a\n' +
    'a   second a\n' +
    'a   third a\n' +
    '\n' +
    'some link';
  const actual = alert.parse({ data, link });

  t.deepEqual(expected, actual);
});

test('parse() without link', t => {
  const expected = '♫ Get Ready... 3\n' +
    'a   first a\n' +
    'a   second a\n' +
    'a   third a\n' +
    '\n';
  const actual = alert.parse( {data });

  t.deepEqual(expected, actual);
});

test('parse() returns nil when there is no data in sheets', t => {
  const expected = '';
  const actual = alert.parse({ data: [] });

  t.deepEqual(expected, actual);
});

test('parse() returns nil when there are no alert found', t => {
  const expected = '';
  mockdate.set(moment('03 Mar 2018 18:30:00', 'DD MMM YYYY HH:mm:ss'));

  const actual = alert.parse({ data });

  t.deepEqual(expected, actual);
});
