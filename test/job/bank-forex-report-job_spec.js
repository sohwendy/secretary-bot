import test from 'ava';

const rewire = require('rewire');
// const constants = require('../../config/constants');

const sheetApiMock = {
  get: (file, scope, readOptions) => {
    return [
      [file, '', ''],
      [scope, '', ''],
      ['Z', readOptions, 'C']
    ];
  },
  set: (_file, _scope, _writeOPtions, _dataCells) => {
    return 5;
  }
};
const bankForexApi = {
  get: () => {
    return { AA: 1, BB: 3, DD: 3, SGD: 5 };
  }
};

const exceptionMock = () => { throw 'this is an exception'; };

let job;
test.beforeEach(() => {
  job = rewire('../../src/job/bank-forex-report-job');
  job.__set__('SheetApi', sheetApiMock);
  job.__set__('BankForexApi', bankForexApi);
});

test('generateDataArray works', async t => {
  const expected = ['a', 'b1', 'b2', 'b3', 'c1', 'c2','c3'];
  const data = [
    { sellPrice: 'b1', buyTTPrice: 'b2', buyODPrice: 'b3' },
    { sellPrice: 'c1', buyTTPrice: 'c2', buyODPrice: 'c3' }
  ];
  const actual = job._generateDataArray(data, ['a']);

  t.deepEqual(expected, actual);
});

test('generateMeta works', async t => {
  const expected = [
    { id: 'A0', code: 'A1', buyRate: 'A2', sellRate: 'A3' },
    { id: 'B0', code: 'B1', buyRate: 'B2', sellRate: 'B3' },
  ];

  const list = [
    ['A0', '', '', 'B0', '', ''],
    ['A1', '', '', 'B1', '', ''],
    ['A2', 'A3', 'A4', 'B2', 'B3', 'B4']
  ];

  const actual = job._generateMeta(list);

  t.deepEqual(expected, actual);
});

test('readSheet works', async t => {
  const options = {
    file: 'file',
    scope: 'scope',
    read: { range: 'range' },
  };
  const expected = [
    { id: 'file', code: 'scope', buyRate: 'Z', sellRate: { range: 'range', spreadsheetId: 'spreadsheetId'} }
  ];

  const actual = await job._readSheet('spreadsheetId', options);

  t.deepEqual(expected, actual);
});

test('readSheet works', async t => {
  const data = {
    date: 'date',
    data: [{
      sellPrice: 'sellPrice',
      buyTTPrice: 'buyTTPrice',
      buyODPrice: 'buyODPrice'
    }]
  };
  const options = {
    file: 'file',
    scope: 'scope',
    write: { range: 'range' }
  };
  //TODO: fix this test
  const expected = 5;

  const actual = await job._writeSheet(data, 'ssid', options);

  t.deepEqual(expected, actual);
});

test.skip('fetch works', async t => {
  t.true(true);
});

test('fetch handles exception', async t => {
  job.__set__('SheetApi', exceptionMock);

  const expected = '';
  const actual = await job.update({ fake: true });

  t.is(expected, actual);
});
