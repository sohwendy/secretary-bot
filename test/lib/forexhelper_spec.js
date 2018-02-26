import test from 'ava';
const helper = require('../../lib/forexhelper');

test('roundDown with default precision', t => {
  const expected = 0.456;
  const actual = helper.roundDown(0.45678);

  t.is(expected, actual);
});

test('roundDown with precision of 5', t => {
  const expected = 0.12345;
  const actual = helper.roundDown(0.12345, 5);

  t.is(expected, actual);
});

test('roundUp with default precision', t => {
  const expected = 0.457;
  const actual = helper.roundUp(0.45678);

  t.is(expected, actual);
});

test('roundUp with precision of 5', t => {
  const expected = 0.12346;
  const actual = helper.roundUp(0.12346, 5);

  t.is(expected, actual);
});


test('pad with default digit', t => {
  const expected = '  0.3';
  const actual = helper.pad(0.3);

  t.is(expected, actual);
});

test('pad with 7 spaces', t => {
  const expected = '    1.1';
  const actual = helper.pad(1.1, 7);

  t.is(expected, actual);
});
