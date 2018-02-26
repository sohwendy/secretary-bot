import test from 'ava';
const rewire = require('rewire');
const secretsMock = require('../../sample/sheets');
const constants = require('../../config/constants');


const readSheetsMock = params => { return { data: { values: params } }; };
const authMock = (file, scope, options) => Object.assign({ auth: `${file},${scope}` }, options);
const parserMock = { parse: param => param };
const emptyMock = { parse: () => '' } ;
const exceptionMock = { parse: () => { throw 'this is an exception'; } };
let rewireMock = [];
let sheets;

test.beforeEach(() => {
  sheets = rewire('../../src/sheets.js');
  rewireMock.push(sheets.__set__('readSheets', readSheetsMock));
  rewireMock.push(sheets.__set__('secrets', secretsMock));
  rewireMock.push(sheets.__set__('auth', authMock));
});

test('_getSecrets() returns real path', async t => {
  const expected = `${constants.secretPath.real}/sheets`;
  const actual = sheets._getSecrets();

  t.deepEqual(expected, actual);
});

test('_getSecrets(true) returns fake path', async t => {
  const expected = `${constants.secretPath.fake}/sheets`;
  const actual = sheets._getSecrets(true);

  t.deepEqual(expected, actual);
});

test('fetchNotification() works', async t => {
  rewireMock.push(sheets.__set__('notification', parserMock));
  const expected = {
    data: {
      auth: `${secretsMock.file},${secretsMock.scope}`,
      spreadsheetId: secretsMock.id,
      range: secretsMock.range
    },
    link: secretsMock.link
  };
  const actual = await sheets.fetchNotification(true);

  t.deepEqual(expected, actual);
});

test('fetchNotification() returns empty string', async t => {
  rewireMock.push(sheets.__set__('notification', emptyMock));
  const expected = '';
  const actual = await sheets.fetchNotification(true);

  t.deepEqual(expected, actual);
});

test('fetchNotification() returns empty string upon exception', async t => {
  rewireMock.push(sheets.__set__('notification', exceptionMock));
  const expected = '';
  const actual = await sheets.fetchNotification(true);

  t.deepEqual(expected, actual);
});


test('fetchAlert() works', async t => {
  rewireMock.push(sheets.__set__('alert', parserMock));
  const expected = {
    data: {
      auth: `${secretsMock.file},${secretsMock.scope}`,
      spreadsheetId: secretsMock.id,
      range: secretsMock.range
    },
    link: secretsMock.link
  };
  const actual = await sheets.fetchAlert(true);

  t.deepEqual(expected, actual);
});

test('fetchAlert() returns empty string', async t => {
  rewireMock.push(sheets.__set__('alert', emptyMock));
  const expected = '';
  const actual = await sheets.fetchAlert(true);

  t.deepEqual(expected, actual);
});

test('fetchAlert() returns empty string upon exception', async t => {
  rewireMock.push(sheets.__set__('alert', exceptionMock));
  const expected = '';
  const actual = await sheets.fetchAlert(true);

  t.deepEqual(expected, actual);
});
