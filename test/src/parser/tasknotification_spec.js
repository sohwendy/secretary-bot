const test = require('ava');
const mockdate = require('mockdate');
const moment = require('moment');
const notification = require('../../../src/parser/tasknotification');

const data = [
  [ '02 Mar 2018', '00:00:00', 'no', 'empty'],
  [ '03 Mar 2018', '00:00:00', 'a', 'first a'],
  [ '03 Mar 2018', '00:00:00', 'a', 'second a'],
  [ '03 Mar 2018', '00:00:00', 'a', 'third a'],
  [ '05 Mar 2018', '00:00:00', 'b', 'first b'],
  [ '05 Mar 2018', '00:00:00', 'b', 'second b'],
  [ '06 Mar 2018', '00:00:00', 'no', 'empty'],
  [ '27 Mar 2018', '00:00:00', 'no', 'empty'],
];

const list = [];
list[0] = [
  { type: 'a', title: 'first a' },
  { type: 'a', title: 'second a'},
  { type: 'a', title: 'third a'}
];
list[2] = [
  { type: 'b', title: 'first b' },
  { type: 'b', title: 'second b'}
];

const dayEvents = [];
dayEvents[0] = 'd0 e1\n';
dayEvents[2] = 'd2 e1 e2 e3\n';

const dateHeaders = ['today', 'tomorrow', 'after tomorrow'];
mockdate.set(moment('03 Mar 2018 18:00:00', 'DD MMM YYYY HH:mm:ss'));

test('_stringify', t => {
  const expected = 'a   first a\na   second a\na   third a\n';
  const actual = notification._stringify(list[0]);

  t.deepEqual(expected, actual);
});
//
test('_createHeader for today', t => {
  const today = moment('03 Mar 2018', 'DD MMM YYYY');
  const expected = '3) Today 03 Mar Sat';
  const _createHeader = notification._createHeader.bind(today);

  const actual = _createHeader(list, 0);

  t.deepEqual(expected, actual);
});

test('_createHeader for 2 days after', t => {
  const today = moment('03 Mar 2018', 'DD MMM YYYY');
  const expected = '2)  05 Mar Mon';
  const _createHeader = notification._createHeader.bind(today);
  const actual = _createHeader(list[2], 2);

  t.deepEqual(expected, actual);
});

test('_filterAndFormat', t => {
  const today = moment('03 Mar 2018', 'DD MMM YYYY');
  const actual = notification._filterAndFormat(data, today);

  t.deepEqual(list, actual);
});

test('_formatContent', t => {
  const expected = 'today\n' +
    'd0 e1\n' +
    '\n' +
    'after tomorrow\n' +
    'd2 e1 e2 e3\n';
  const actual = notification._formatContent(dayEvents, dateHeaders);

  t.is(expected, actual);
});

test('parse()', t => {
  const link = 'some link';
  const expected = 'Coming up...\n' +
    '\n' +
    '3) Today 03 Mar Sat\n' +
    'a   first a\n' +
    'a   second a\n' +
    'a   third a\n\n' +
    '2)  05 Mar Mon\n' +
    'b   first b\n' +
    'b   second b\n\n' +
    'some link';
  const actual = notification.parse({data, link});

  t.deepEqual(expected, actual);
});

test('parse() without link', t => {
  const expected = 'Coming up...\n' +
    '\n' +
    '3) Today 03 Mar Sat\n' +
    'a   first a\n' +
    'a   second a\n' +
    'a   third a\n\n' +
    '2)  05 Mar Mon\n' +
    'b   first b\n' +
    'b   second b\n\n';
  const actual = notification.parse( {data });

  t.deepEqual(expected, actual);
});

test('parse() returns nil when there is no data in sheets', t => {
  const expected = '';
  const actual = notification.parse({ data: [] });

  t.deepEqual(expected, actual);
});

test('parse() returns no event when there are no notification found', t => {
  const expected = 'No events';
  mockdate.set(moment('07 Mar 2018 18:30:00', 'DD MMM YYYY HH:mm:ss'));

  const actual = notification.parse({ data });

  t.deepEqual(expected, actual);
});
