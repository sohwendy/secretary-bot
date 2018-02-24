import test from 'ava';
const rewire = require('rewire');
const auth = rewire('../src/auth.js');

const secrets = {
  client_email: 'client_email',
  private_key: 'private_key'
};
const noop = () => {};

function JWT(email, _a, key, scope, _b){
  this.email = email;
  this.key = key;
  this.scope = scope;
  this.authorize = noop;
}

const readFileMock = json => JSON.stringify(secrets);
const googleMock = { auth: { JWT: JWT } };
let rewireMock = [];

test.before(_ => {
  rewireMock.push(auth.__set__('readFile', readFileMock));
  rewireMock.push(auth.__set__('google', googleMock));
});

test.after(_ => rewireMock.map(m => m()));

test('function', async t => {
  const expected = new JWT(secrets.client_email, null, secrets.private_key, 'some_scope', null);
  const actual = await auth('', 'some_scope');

  t.deepEqual(expected, actual);
});
