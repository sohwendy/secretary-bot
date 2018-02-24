import test from 'ava';
const rewire = require('rewire');
const sheets = rewire('../src/sheets.js');

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
let rewireMock = [];

test.before(_ => {
  rewireMock.push(sheets.__set__('readSheets', readSheetsMock));
  rewireMock.push(sheets.__set__('secrets', secretsMock));
  rewireMock.push(sheets.__set__('auth', authMock));
  rewireMock.push(sheets.__set__('parser', parserMock));
});

test.after(_ => rewireMock.map(m => m()));

test('fetch', async t => {
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
