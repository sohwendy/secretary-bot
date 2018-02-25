import test from 'ava';
const rewire = require('rewire');

const secretsMock = {
  file: 'some_file',
  link: 'some_link',
  scope: 'some_test',
  id: 'some_id',
  range: 'some_range'
};

const readSheetsMock = params => { return { data: { values: params } }; };
const authMock = (file, scope) => `${file},${scope}`;
const parserMock = { parse: param => param };
const emptyMock = { parse: () => '' } ;
const exceptionMock = { parse: () => { throw 'this is an exception'; } };
let rewireMock = [];
let sheets;

test.beforeEach(() => {
  sheets = rewire('../src/sheets.js');
  rewireMock.push(sheets.__set__('readSheets', readSheetsMock));
  rewireMock.push(sheets.__set__('secrets', secretsMock));
  rewireMock.push(sheets.__set__('auth', authMock));
});

test('fetchNotification()', async t => {
  rewireMock.push(sheets.__set__('notification', parserMock));
  const expected = {
    data: {
      auth: 'some_file,some_test',
      spreadsheetId: 'some_id',
      range: 'some_range'
    },
    link: 'some_link'
  };
  const actual = await sheets.fetchNotification();

  t.deepEqual(expected, actual);
});

test('fetchNotification() returns nil', async t => {
  rewireMock.push(sheets.__set__('notification', emptyMock));
  const expected = undefined;
  const actual = await sheets.fetchNotification();

  t.deepEqual(expected, actual);
});

test('fetchNotification() returns nil upon exception', async t => {
  rewireMock.push(sheets.__set__('notification', exceptionMock));
  const expected = undefined;
  const actual = await sheets.fetchNotification();

  t.deepEqual(expected, actual);
});


test('fetchAlert()', async t => {
  rewireMock.push(sheets.__set__('alert', parserMock));
  const expected = {
    data: {
      auth: 'some_file,some_test',
      spreadsheetId: 'some_id',
      range: 'some_range'
    },
    link: 'some_link'
  };
  const actual = await sheets.fetchAlert();

  t.deepEqual(expected, actual);
});

test('fetchAlert() returns nil', async t => {
  rewireMock.push(sheets.__set__('alert', emptyMock));
  const expected = undefined;
  const actual = await sheets.fetchAlert();

  t.deepEqual(expected, actual);
});

test('fetchAlert() returns nil upon exception', async t => {
  rewireMock.push(sheets.__set__('alert', exceptionMock));
  const expected = undefined;
  const actual = await sheets.fetchAlert();

  t.deepEqual(expected, actual);
});
