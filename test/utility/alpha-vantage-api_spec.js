import test from 'ava';
const rewire = require('rewire');
const stub = require('../_stub');

let helper;
test.beforeEach(() => {
  helper = rewire('../../src/utility/alpha-vantage-api');
});

const json =
  '{\n' +
  '    "Global Quote": {\n' +
  '        "01. symbol": "A.SI",\n' +
  '        "02. open": "2.9300",\n' +
  '        "03. high": "2.9400",\n' +
  '        "04. low": "2.9000",\n' +
  '        "05. price": "9.9",\n' +
  '        "06. volume": "683700",\n' +
  '        "07. latest trading day": "2018-09-21",\n' +
  '        "08. previous close": "2.9200",\n' +
  '        "09. change": "0.11",\n' +
  '        "10. change percent": "-0.6849%"\n' +
  '    }\n' +
  '}';

const jsonData = {
  changeAmount: '0.11',
  code: 'A.SI',
  price: '9.9',
};

test('_constructUrl works', async t => {
  const expected = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=one&apikey=key';
  const actual = helper._constructUrl('key', 'one',);

  t.is(expected, actual);
});

test('_transform', async t => {
  const expected = jsonData;
  const actual = helper._transform(json);

  t.deepEqual(expected, actual);
});

test('get works', async t => {
  const axiosMock = {
    get: (url, { transformResponse }) => {
      return { url, data: transformResponse(json) };
    }
  };
  helper.__set__('axios', axiosMock);

  const expected = jsonData;
  const actual = await helper.get('foo', 'bar');

  t.deepEqual(expected, actual);
});

test('get handles exception', async t => {
  const axiosMock = { get: stub.exceptionMock };
  helper.__set__('axios', axiosMock);

  const expected = '';
  const actual = await helper.get('one', 'two');

  t.is(expected, actual);
});
