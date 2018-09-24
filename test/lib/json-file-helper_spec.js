import test from 'ava';
const helper = require('../../src/lib/json-file-helper');

test('get works', async t => {
  const expected = {
    chatId: '<telegram_chat_id>',
    token: '<telegram_bot_token>'
  };
  const actual = await helper.read('sample/chat.json');

  t.deepEqual(expected, actual);
});


test('get handles exception', async t => {
  const expected = {};
  const actual = await helper.read('sample/chat');

  t.deepEqual(expected, actual);
});
