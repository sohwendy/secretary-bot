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

test('fetch()', async t => {
  rewireMock.push(sheets.__set__('parser', parserMock));
  const expected = {
    data: {
      auth: 'some_file,some_test',
      spreadsheetId: 'some_id',
      range: 'some_range'
    },
    link: 'some_link'
  };
  const actual = await sheets.fetch();

  t.deepEqual(expected, actual);
});

test('fetch() returns nil', async t => {
  rewireMock.push(sheets.__set__('parser', emptyMock));
  const expected = undefined;
  const actual = await sheets.fetch();

  t.deepEqual(expected, actual);
});

test('fetch() returns nil upon exception', async t => {
  rewireMock.push(sheets.__set__('parser', exceptionMock));
  const expected = undefined;
  const actual = await sheets.fetch();

  t.deepEqual(expected, actual);
});
