import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');
const stub = require('../_stub');
const SheetApi = require('../../src/utility/google-sheet-api');

const bankForexApi = {
  get: () => {
    return { AA: 1, BB: 3, DD: 3, SGD: 5 };
  }
};

const options = {
  file: 'file',
  scope: 'scope',
  read: { range: 'read_range' },
  write: { range: 'write_range' }
};

const readOptions = { spreadsheetId: 'ssid', ...options.read };
const writeOptions = { spreadsheetId: 'ssid', ...options.write };

const constants = {
  secretPath: stub.secretPath,
  bankforex: {
    file: './.secrets/google.json',
    read: { range: 'ss_tab_read_range' },
    scope: [ 'https://www.googleapis.com/auth/spreadsheets' ],
    write: { range: 'ss_tab_write_range' }
  }
};

test.beforeEach(t => {
  let sandbox = sinon.createSandbox();

  t.context.sandbox = sandbox;
  t.context.sheetApiMock  = sandbox.mock(SheetApi);
  t.context.job = rewire('../../src/job/bank-forex-report-job');
  const { job } = t.context;

  job.__set__('BankForexApi', bankForexApi);
  job.__set__('constants', constants);
});

test.afterEach.always(t => {
  t.context.sandbox.restore();
});

test('generateDataArray works', async t => {
  const expected = ['a', 'b1', 'b2', 'b3', 'c1', 'c2','c3'];
  const data = [
    { sellPrice: 'b1', buyTTPrice: 'b2', buyODPrice: 'b3' },
    { sellPrice: 'c1', buyTTPrice: 'c2', buyODPrice: 'c3' }
  ];
  const actual = t.context.job._generateDataArray(data, ['a']);

  t.deepEqual(expected, actual);
});

test('readSheet works', async t => {
  const { job, sheetApiMock } = t.context;
  const expected = [ { id: 'usdollar', code: 'usd', buyRate: 1, sellRate: 2 } ];

  sheetApiMock.expects('read')
    .withExactArgs('file', 'scope', readOptions)
    .once()
    .returns([
      ['usdollar', '', ''],
      ['usd', '', ''],
      ['1', '2', '']]
    );

  const actual = await job._readSheet('ssid', options);

  t.true(sheetApiMock.verify());
  t.deepEqual(expected, actual);
});

test('writeSheet works', async t => {
  const { job, sandbox, sheetApiMock } = t.context;
  const expected = 5;

  const data = { date: '01-02-2018', data: ['a'] };
  const arrayMock = sandbox.mock()
    .withExactArgs(data.data, [data.date])
    .returns([])
    .once();

  job.__set__('generateDataArray', arrayMock);

  sheetApiMock.expects('write')
    .withExactArgs('file', 'scope', writeOptions, [])
    .once()
    .returns(expected);

  const actual = await job._writeSheet(data, 'ssid', options);

  t.true(sheetApiMock.verify());
  t.true(arrayMock.verify());
  t.deepEqual(expected, actual);
});

test('fetch works', async t => {
  const { job, sandbox } = t.context;
  const expected = 5;

  const readSheetMock = sandbox.mock()
    .withExactArgs('<bank forex>', constants.bankforex)
    .returns(['a'])
    .once();
  job.__set__('readSheet', readSheetMock);

  const writeSheetMock = sandbox.mock()
    .withExactArgs(bankForexApi.get(), '<bank forex>', constants.bankforex)
    .returns(expected)
    .once();
  job.__set__('writeSheet', writeSheetMock);

  const actual = await job.update();

  t.true(readSheetMock.verify());
  t.true(writeSheetMock.verify());
  t.deepEqual(expected, actual);
});

test('fetch handles exception', async t => {
  t.context.job.__set__('SheetApi', stub.exceptionMock);

  const expected = 0;
  const actual = await t.context.job.update();

  t.is(expected, actual);
});
