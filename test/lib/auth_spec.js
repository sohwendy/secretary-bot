import test from 'ava';
const rewire = require('rewire');

/* eslint-disable */
const secrets = {
  client_email: 'client_email',
  private_key: 'private_key'
};
/* eslint-enable */

const noop = () => {};

function Jwt(email, _a, key, scope, _b){
  this.email = email;
  this.key = key;
  this.scope = scope;
  this.authorize = noop;
}

const readFileMock = () => JSON.stringify(secrets);
const exceptionMock = () => { throw 'exception'; };
const googleMock = { auth: { JWT: Jwt } };
let auth;

test.before(() => {
  auth = rewire('../../lib/auth.js');
  auth.__set__('google', googleMock);
});

test('function', async t => {
  auth.__set__('readFile', readFileMock);
  const expected = {
    auth: new Jwt(secrets.client_email, null, secrets.private_key, 'some_scope', null),
    foo: 'bar'
  };
  const actual = await auth('', 'some_scope', {foo: 'bar'});

  t.deepEqual(expected, actual);
});

test('function returns undefined on exception', async t => {
  auth.__set__('readFile', exceptionMock);
  const expected = undefined;
  const actual = await auth('', 'some_scope');

  t.deepEqual(expected, actual);
});
