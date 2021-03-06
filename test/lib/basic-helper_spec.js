import test from 'ava';

const helper = require('../../src/lib/basic-helper');

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

test('round with default precision', t => {
  const expected = 0.457;
  const actual = helper.round(0.45678);

  t.is(expected, actual);
});

test('round up with precision of 4', t => {
  const expected = 0.1235;
  const actual = helper.round(0.123467, 4);

  t.is(expected, actual);
});

test('round down with precision of 6', t => {
  const expected = 0.234671;
  const actual = helper.round(0.2346711, 6);

  t.is(expected, actual);
});

test('calculateUnit returns rate', t => {
  const row = { price: 100, buyUnit: 5.55, sellUnit: 4.44 };
  const expected = { sellRate: 0.045, buyRate: 18.018, ...row };

  const actual = helper.calculateUnit(row);

  t.deepEqual(expected, actual);
});

test('calculateUnit rounds buyrate', t => {
  const row = { price: 255, buyUnit: 1, sellUnit: 4.5 };
  const expected = { sellRate: 0.018, buyRate: 255, ...row };

  const actual = helper.calculateUnit(row);

  t.deepEqual(expected, actual);
});

test('calculateExchangeRate returns rate', t => {
  const expected = 5.5;
  const actual = helper.calculateExchangeRate(11, 2);

  t.is(expected, actual);
});

test('calculateExchangeRate returns 0 for invalid local value', t => {
  const expected = 0;
  const actual = helper.calculateExchangeRate(11, 0);

  t.is(expected, actual);
});

test('displayChat works', async t => {
  const expected = 'title\n```\nfoo\nbar\nbaz\n```\nlink';
  const actual = helper.displayChat(['foo', 'bar', 'baz'], 'title', 'link');

  t.is(expected, actual);
});

test('displayChat returns empty string if list is empty', async t => {
  const expected = '';
  const actual = helper.displayChat([], 'title', 'link');

  t.is(expected, actual);
});

test('displayChat without link', async t => {
  const expected = 'title\n```\nfoo\nbar\nbaz\n```\n';
  const actual = helper.displayChat(['foo', 'bar', 'baz'], 'title');

  t.is(expected, actual);
});

test('pad with default digit', t => {
  const expected = '    0.3';
  const actual = helper.pad(0.3);

  t.is(expected, actual);
});

test('pad with 7 spaces', t => {
  const expected = '    1.1';
  const actual = helper.pad(1.1, 7);

  t.is(expected, actual);
});
