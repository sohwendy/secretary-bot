import test from 'ava';

const rewire = require('rewire');

const log = () => {};

let helper;
test.beforeEach(() => {
  helper = rewire('../../src/utility/open-exchange-rate-api');
});

test('_constructUrl works', async t => {
  const expected = 'https://openexchangerates.org/api/latest.json?app_id=one';
  const actual = helper._constructUrl('one');

  t.is(expected, actual);
});

test('get works', async t => {
  const axiosMock = {
    get: () => {
      return { data: { rates: 'rates' } };
    }
  };
  helper.__set__('axios', axiosMock);

  const expected = 'rates';
  const actual = await helper.get('one', log);

  t.is(expected, actual);
});

test('get handles exception', async t => {
  const axiosMock = { get: () => { throw 'exception'; } };
  helper.__set__('axios', axiosMock);

  const expected = '';
  const actual = await helper.get('one', log);

  t.is(expected, actual);
});
