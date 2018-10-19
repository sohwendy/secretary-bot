import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');

let helper;
const rateData = { SGD: 1.35, USD: 1, CNY: 7 };
const output = [
  { code: 'CNY', price: 5.185185185185185 },
  { code: 'SGD', price: 1 },
  { code: 'USD', price: 0.7407407407407407 }
];

test.beforeEach(t => {
  helper = rewire('../../src/utility/open-exchange-rate-api');
  t.context.sandbox = sinon.createSandbox();
});

test.afterEach(t => {
  t.context.sandbox.restore();
});

test('_constructUrl works', async t => {
  const expected = 'https://openexchangerates.org/api/latest.json?app_id=one';
  const actual = helper._constructUrl('one');

  t.is(expected, actual);
});

test('transform works', async t => {
  const actual = await helper._transform(rateData);

  t.deepEqual(output, actual);
});

test('get2 works', async t => {
  const { sandbox } = t.context;

  const config = { key: 'key' };
  const response = { data: { rates: rateData } };
  const getStub = sandbox.stub();
  const axiosMock = { get: getStub };

  helper.__set__('axios', axiosMock);

  getStub
    .withArgs('https://openexchangerates.org/api/latest.json?app_id=key')
    .returns(Promise.resolve(response));

  const actual = await helper.get2(config);

  t.is(axiosMock.get.callCount, 1);
  t.deepEqual(output, actual);
});

test('get2 returns empty string', async t => {
  const { sandbox } = t.context;

  const config = { key: 'key' };
  const response = { data: '' };
  const getStub = sandbox.stub();
  const axiosMock = { get: getStub };

  helper.__set__('axios', axiosMock);

  axiosMock.get
    .withArgs('https://openexchangerates.org/api/latest.json?app_id=key')
    .returns(Promise.resolve(response));

  const actual = await helper.get2(config);

  t.is('', actual);
});

test('get2 handles exception', async t => {
  const { sandbox } = t.context;
  const axiosMock = { get: sandbox.stub() };
  helper.__set__('axios', axiosMock);

  axiosMock.get.throws();

  const expected = '';
  const actual = await helper.get2({});

  t.is(expected, actual);
});
