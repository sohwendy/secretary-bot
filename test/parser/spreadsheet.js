const test = require('ava');
const mockdate = require('mockdate');
const moment = require('moment');
const sheets = require('../../src/parser/spreadsheet');


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
dayEvents[0] = 'd0 e1';
dayEvents[2] = 'd2 e1 e2 e3';

const dateHeaders = ['today', 'tomorrow', 'after tomorrow'];
mockdate.set(moment('03 Mar 2018 18:00:00', 'DD MMM YYYY HH:mm:ss'));

test('_stringifyPerDayEvents', t => {
  const expected = [
    'a   first a\n a   second a\n a   third a\n ',
    undefined,
    'b   first b\n b   second b\n ',
  ];
  const actual = sheets._stringifyPerDayEvents(list);

  t.deepEqual(expected, actual);
});

test('_createDateHeaders', t => {
  const today = moment('03 Mar 2018', 'DD MMM YYYY');
  const expected = ['3) Today 03 Mar Sat', undefined, '2)  05 Mar Mon'];
  const actual = sheets._createDateHeaders(dayEvents, list, today);

  t.deepEqual(expected, actual);
});

test('_filterEvents', t => {
  const today = moment('03 Mar 2018', 'DD MMM YYYY');
  const actual = sheets._filterEvents(data, today);

  t.deepEqual(list, actual);
});

test('_formatChat', t => {
  const expected = 'today\n' + ' d0 e1\n' + 'after tomorrow\n' + ' d2 e1 e2 e3\n';
  const actual = sheets._formatChat(dayEvents, dateHeaders);

  t.is(expected, actual);
});

test('parse()', t => {
  const link = 'some link';
  const expected = 'Coming up...\n' +
    '\n' +
    '3) Today 03 Mar Sat\n' +
    ' a   first a\n' +
    ' a   second a\n' +
    ' a   third a\n \n' +
    '2)  05 Mar Mon\n' +
    ' b   first b\n' +
    ' b   second b\n \n' +
    ' some link';
  const actual = sheets.parse({data, link});

  t.deepEqual(expected, actual);
});
