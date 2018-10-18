import test from 'ava';
const rewire = require('rewire');
import sinon from 'sinon';
const stub = require('../_stub');

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
const sheetParams = {
  spreadsheetId: 'id',
  range: 'range'
};

const authData = {
  token: 'token',
  permission: 'permission',
};

function Jwt(email, _a, key, permission, _b) {
  this.email = email;
  this.key = key;
  this.permission = permission;
  this.authorize = noop;
}

const googleMock = { auth: { JWT: Jwt } };
const readFileMock = () => JSON.stringify(secrets);
// const sheetsMock = {
//   get: _ => { return { data: { values: sheetsCells } }; },
//   append: params => { return { data: { updates: { updatedCells: params } } }; },
// };


test.beforeEach(t => {
  t.context.sandbox = sinon.createSandbox();
  helper = rewire('../../src/utility/google-sheet-api');
  helper.__set__('google', googleMock);
  helper.__set__('readFile', readFileMock);

  t.context.helper = helper;
});

test('auth works', async t => {
  const expectedJwtClient = new Jwt(
    secrets.client_email,
    '',
    secrets.private_key,
    authData.permission
  );

  const actualJwtClient = await helper._auth(authData);

  t.deepEqual(expectedJwtClient, actualJwtClient);
});

const options = {
  ...authData,
  ...sheetParams
};
const params = {
  auth: {},
  ...sheetParams
};
const jwtClient = {};

test('read2 works', async t => {
  const { sandbox } = t.context;
  const expected = 'values';

  const sheets = { get: sandbox.stub()};
  const authStub = sandbox.stub();
  const transformStub = sandbox.stub();
  helper.__set__('sheets', sheets);
  helper.__set__('auth',  authStub);

  authStub
    .withArgs(authData)
    .returns(jwtClient);

  sheets.get
    .withArgs(params)
    .returns(Promise.resolve({ data: { values: sheetsCells } }));

  transformStub
    .withArgs(sheetsCells)
    .returns(expected);

  const actual = await helper.read2(options, transformStub);

  t.is(authStub.callCount, 1);
  t.is(sheets.get.callCount, 1);
  t.is(transformStub.callCount, 1);
  t.is(expected, actual);
});

test('read2 handles exception', async t => {
  const readFileMock = stub.exceptionMock;
  helper.__set__('readFile', readFileMock);

  const expected = '';
  const actual = await helper.read2('', '', {});

  t.is(expected, actual);
});


test('read2 handles exception', async t => {
  const readFileMock = stub.exceptionMock;
  helper.__set__('readFile', readFileMock);

  const expected = '';
  const actual = await helper.read2('', '', {});

  t.is(expected, actual);
});

test('write2 works', async t => {
  const { sandbox } = t.context;

  const sheets = { append: sandbox.stub()};
  const authStub = sandbox.stub();
  helper.__set__('auth',  authStub);
  helper.__set__('sheets', sheets);
  const values = ['a', 'b'];
  const expected = 5;

  const params = {
    auth: jwtClient,
    resource: {
      majorDimension: 'ROWS',
      values: [values]
    },
    ...sheetParams,
    valueInputOption: 'USER_ENTERED',
  };

  authStub
    .withArgs(authData)
    .returns(jwtClient);

  sheets.append
    .withArgs(params)
    .returns(Promise.resolve({ data: { updates: { updatedCells: expected } } }));

  const actual = await helper.write2(options, values);

  t.is(authStub.callCount, 1);
  t.is(sheets.append.callCount, 1);
  t.deepEqual(expected, actual);
});

test('write handles exception', async t => {
  const readFileMock = stub.exceptionMock;
  helper.__set__('readFile', readFileMock);

  const expected = '';
  const actual = await helper.write2('', '', {});

  t.is(expected, actual);
});
