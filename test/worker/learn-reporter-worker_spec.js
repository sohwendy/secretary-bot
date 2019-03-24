import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');
const constants = require('../../config/constants').learn;
const SheetApi = require('../../src/utility/google-sheet-api');

const total = [ { total: 5 }];
const day = 99;
const content = 'Kuroko loves basketball';

const code = [ {
  display: 'Y',
  content: content,
  domain: 'anime'
}];

const codeConfig = {
  range: 'A$G$'
};

test.beforeEach(t => {
  t.context.worker = rewire('../../src/worker/learn-report-worker');
  t.context.sandbox = sinon.createSandbox();

  const { worker, sandbox } = t.context;

  t.context.sheetApiMock  = sandbox.mock(SheetApi);

  constants.file =  './sample/google.json';
  constants.secretFile = './sample/learn.json';
  worker.__set__('constants', constants);
});

test.afterEach.always(t => {
  t.context.sandbox.restore();
});

test.serial('_stringify return content', async t => {
  const expected = content;
  const actual = t.context.worker._stringify(code[0]);

  t.is(expected, actual);
});

test.serial('_findIndex returns count', async t => {
  const expected = 5;
  const actual = t.context.worker._findIndex(day, total);

  t.is(expected, actual);
});

test.serial('_findIndex returns 1', async t => {
  const expected = 1;
  const actual = t.context.worker._findIndex(99, '');

  t.is(expected, actual);
});


test.serial('init() returns config', async t => {
  const expected = {
    title: constants.title,
    rules: {
      token: './sample/google.json',
      permission: [ 'https://www.googleapis.com/auth/spreadsheets.readonly' ],
      spreadsheetId: '<learn_sheet_id>',
      range: 'ToKnow!A1:A1'
    },
    code: {
      token: './sample/google.json',
      permission: [ 'https://www.googleapis.com/auth/spreadsheets.readonly' ],
      spreadsheetId: '<learn_sheet_id>',
      range: 'ToKnow!B$:D$'
    }
  };

  const actual = await t.context.worker.init(constants);

  t.deepEqual(expected, actual.config);
});

test.serial('init() returns transform', async t => {
  const { worker, sandbox } = t.context;

  const arrayToHash = { bind: sandbox.stub() };

  worker.__set__('arrayToHash', arrayToHash);

  await worker.init(constants);

  t.is(arrayToHash.bind.callCount, 2);
  t.is(arrayToHash.bind.calledWithExactly(constants.rules.fields), true);
  t.is(arrayToHash.bind.calledWithExactly(constants.code.fields), true);
});

test.serial('execute() works', async t => {
  const { worker, sheetApiMock } = t.context;
  const settings = {
    config: {
      rateKey: 'rateKey',
      code: codeConfig,
      rules: 'rules'
    },
    transformRules: () => {},
    transformCode: () => {},
  };

  sheetApiMock
    .expects('read')
    .withExactArgs('rules',  settings.transformRules)
    .once()
    .returns(total);

  sheetApiMock
    .expects('read')
    .withExactArgs({range: 'A5G5'}, settings.transformCode)
    .once()
    .returns(code);

  const actual = await worker.execute(settings, day);

  t.true(sheetApiMock.verify());
  t.deepEqual([code[0].content], actual);
});
