import test from 'ava';

const constants = require('../../config/constants');

test('secretPath works', async t => {
  t.deepEqual('.secrets/a',  constants.secretPath('a'));
});
