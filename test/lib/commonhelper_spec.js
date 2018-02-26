import test from 'ava';
const helper = require('../../lib/commonhelper');
const constants = require('../../config/constants');

test('_getSecrets() returns real path', async t => {
  const expected = `${constants.secretPath.real}/oer`;
  const actual = helper._getSecrets(constants.secretPath, false, 'oer');

  t.deepEqual(expected, actual);
});

test('_getSecrets(true) returns fake path', async t => {
  const expected = `${constants.secretPath.fake}/sheets`;
  const actual = helper._getSecrets(constants.secretPath, true, 'sheets');

  t.deepEqual(expected, actual);
});
