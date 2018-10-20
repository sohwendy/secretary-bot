import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');
const constants = require('../../config/constants').reminder;
const SheetApi = require('../../src/utility/google-sheet-api');

const sheetData = [
  { date: '02 Feb 2018', time: '08:10:00', type: '02', title: 'bite apple',      action: 'n', event: '' },
  { date: '02 Feb 2018', time: '',         type: '02', title: 'peel orange',     action: 'n', event: '' },
  { date: '04 Feb 2018', time: '04:00:00', type: '04', title: 'cut jackfruit',  action: 'n', event: '' },
  { date: '04 Feb 2018', time: '04:00:00', type: '04', title: 'pluck grapefruit',  action: 'n', event: '' },
  { date: '04 Feb 2018', time: '15:00:00', type: '14', title: 'slice strawberry', action: 'n', event: '' },
  { date: '05 Feb 2018', time: '08:10:00', type: '05', title: 'eat durian',     action: 'n', event: '' }
];

test.beforeEach(t => {
  t.context.worker = rewire('../../src/worker/reminder-monitor-worker');
  t.context.sandbox = sinon.createSandbox();

  const { worker, sandbox } = t.context;

  t.context.sheetApiMock  = sandbox.mock(SheetApi);

  constants.file =  './sample/google.json';
  constants.secretFile =  './sample/forex.json';

  worker.__set__('constants', constants);
});

test.afterEach.always(t => {
  t.context.sandbox.restore();
});

test('rule works', async t => {
  const expected = true;
  const datetime = { date: '04 Feb 2018', time: '08' };
  const row = { date: '04 Feb 2018', time: '08:20:00' };
  const actual = t.context.worker._rule(row, datetime);

  t.is(expected, actual);
});

test('rule returns false for non-matching date', async t => {
  const expected = false;
  const datetime = { date: '04 Feb 2018', time: '08' };
  const row = { date: '14 Feb 2018', time: '08:20:00' };
  const actual = t.context.worker._rule(row, datetime);

  t.is(expected, actual);
});

test('rule returns false for non-matching  time', async t => {
  const expected = false;
  const datetime = { date: '04 Feb 2018', time: '08' };
  const row = { date: '04 Feb 2018', time: '04:08:00' };
  const actual = t.context.worker._rule(row, datetime);

  t.is(expected, actual);
});

test('stringify works', async t => {
  const expected = 'type   title';
  const actual = t.context.worker._stringify({ type: 'type', title: 'title' });

  t.is(expected, actual);
});

test('init() returns config', async t => {
  const expected = {
    title: constants.monitorTitle,
    task: {
      token: './sample/google.json',
      permission: [ 'https://www.googleapis.com/auth/spreadsheets.readonly' ],
      spreadsheetId: '<forex_sheet_id>',
      range: constants.task.range
    }
  };

  const actual = await t.context.worker.init(constants);

  t.deepEqual(expected, actual.config);
});

test('init() returns transform', async t => {
  const { worker, sandbox } = t.context;

  const arrayToHash = { bind: sandbox.stub() };

  worker.__set__('arrayToHash', arrayToHash);

  await worker.init(constants);

  t.is(arrayToHash.bind.callCount, 1);
  t.is(arrayToHash.bind.calledWithExactly(constants.fields), true);
});

const list = [
  '04   cut jackfruit',
  '04   pluck grapefruit'
];

test('execute() works', async t => {
  const { worker, sheetApiMock } = t.context;
  const settings = {
    config: {
      task: 'task',
    },
    transform: () => {},
  };
  const datetime = { date: '04 Feb 2018', time: '04' };

  sheetApiMock
    .expects('read')
    .withExactArgs('task', settings.transform)
    .once()
    .returns(sheetData);

  const actual = await worker.execute(settings, datetime);

  t.true(sheetApiMock.verify());
  t.deepEqual(list, actual);
});
