import test from 'ava';

const rewire = require('rewire');

let helper;

/* eslint-disable */
const secrets = {
  client_email: 'client_email',
  private_key: 'private_key'
};
/* eslint-enable */
const noop = () => {};
const sheetsCells = [
  ['r1-c1', 'r1-c2', 'r1-c3'],
  ['r2-c1', 'r2-c2', 'r2-c3']
];

const googleMock = { auth: { JWT: Jwt } };
const readFileMock = () => JSON.stringify(secrets);
const sheetsMock = {
  get: _ => { return { data: { values: sheetsCells } }; },
  append: params => { return { data: { updates: { updatedCells: params } } }; },
};

function Jwt(email, _a, key, scope, _b) {
  this.email = email;
  this.key = key;
  this.scope = scope;
  this.authorize = noop;
}

test.beforeEach(() => {
  helper = rewire('../../src/utility/google-sheet-api');
  helper.__set__('google', googleMock);
  helper.__set__('readFile', readFileMock);
  helper.__set__('sheets', sheetsMock);
});

test('auth works', async t => {
  const expectedJwtClient = new Jwt(
    secrets.client_email,
    '',
    secrets.private_key,
    'scope'
  );

  const actualJwtClient = await helper._auth('', 'scope');

  t.deepEqual(expectedJwtClient, actualJwtClient);
});

test('get works', async t => {
  const axiosMock = {
    get: () => {
      return { data: { rates: 'rates' } };
    }
  };
  helper.__set__('axios', axiosMock);
  const options = { spreadsheetId: 'id', range: 'range' };
  const headers = [ 'header1', 'header2', 'header3' ];

  // const expected = {
  //   auth: new Jwt('client_email', '', 'private_key', 'scope'),
  //   range: 'range',
  //   spreadsheetId: 'id'
  // };

  const expected = [
    { header1: 'r1-c1', header2: 'r1-c2', header3: 'r1-c3' },
    { header1: 'r2-c1', header2: 'r2-c2', header3: 'r2-c3' }
  ];

  const actual = await helper.get('key', 'scope', options, headers );

  t.deepEqual(expected, actual);
});

test('get handles exception', async t => {
  const readFileMock = () => {throw 'exception';};
  helper.__set__('readFile', readFileMock);

  const expected = '';
  const actual = await helper.get('', '', {});

  t.is(expected, actual);
});

test('set works', async t => {
  const axiosMock = {
    set: () => {
      return { data: { rates: 'rates' } };
    }
  };
  helper.__set__('axios', axiosMock);
  const options = { spreadsheetId: 'id', range: 'range' };

  const expected = {
    auth: new Jwt('client_email', '', 'private_key', 'scope'),
    range: 'range',
    resource: {
      majorDimension: 'ROWS',
      values: [['a']]
    },
    spreadsheetId: 'id',
    valueInputOption: 'USER_ENTERED',
  };
  const actual = await helper.set('key', 'scope', options, ['a']);

  t.deepEqual(expected, actual);
});

test('set handles exception', async t => {
  const readFileMock = () => {throw 'exception';};
  helper.__set__('readFile', readFileMock);

  const expected = '';
  const actual = await helper.set('', '', {});

  t.is(expected, actual);
});
