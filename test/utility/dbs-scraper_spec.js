import test from 'ava';
const rewire = require('rewire');
const stub = require('../_stub');

let helper;
test.beforeEach(() => {
  helper = rewire('../../src/utility/dbs-scraper');
});

const html =
  '<div>' +
  '<div class="eff-note">a b 01012018 c d e 7am</div>' +
  '<table>' +
  '<tr name="a">' +
  '<td data-before-text="Selling TT/OD">sellPrice</td>' +
  '<td data-before-text="Buying TT">buyTTPrice</td>' +
  '<td data-before-text="Buying OD">buyODPrice</td>' +
  '</tr>' +
  '</table>'+
  '</div>';

const htmlData = {
  date: '01012018 7am',
  data: [{
    id: 'a',
    sellPrice: 'sellPrice',
    buyTTPrice: 'buyTTPrice',
    buyODPrice: 'buyODPrice'
  }]
};

test('_constructUrl works', async t => {
  const expected = 'https://www.dbs.com.sg/personal/rates-online/foreign-currency-foreign-exchange.page';
  const actual = helper._constructUrl();

  t.is(expected, actual);
});

test('_formatDate works', async t => {
  const expected = '2 6';
  const actual = helper._formatDate('0 1 2 3 4 5 6');

  t.is(expected, actual);
});

test('_transform', async t => {
  const expected = htmlData;
  const bindTransform = helper._transform.bind([{id: 'a'}]);

  const actual = bindTransform(html);

  t.deepEqual(expected, actual);
});

test('get works', async t => {
  const axiosMock = {
    get: (url, { transformResponse }) => {
      return { url, data: transformResponse(html) };
    }
  };
  helper.__set__('axios', axiosMock);

  const expected = htmlData;
  const actual = await helper.get([{ id: 'a' }]);

  t.deepEqual(expected, actual);
});

test('get handles exception', async t => {
  const axiosMock = { get: stub.exceptionMock };
  helper.__set__('axios', axiosMock);

  const expected = '';
  const actual = await helper.get('one', 'two');

  t.is(expected, actual);
});
