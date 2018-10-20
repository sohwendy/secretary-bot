import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');
const constants = require('../../config/constants').reminder;
const SheetApi = require('../../src/utility/google-sheet-api');

const tasks = [
  { date: '02 Feb 2018', time: '08:10:00', type: '🍎', title: 'bite apple',      action: 'n', event: '' },
  { date: '02 Feb 2018', time: '',         type: '🍊', title: 'squeeze orange',     action: 'n', event: '' },
  { date: '04 Feb 2018', time: '04:00:00', type: '🍍', title: 'cut pineapple',  action: 'n', event: '' },
  { date: '04 Feb 2018', time: '15:00:00', type: '🍓', title: 'wash strawberry', action: 'n', event: '' },
  { date: '05 Feb 2018', time: '08:10:00', type: '🍋', title: 'throw lemon',     action: 'n', event: '' }
];

const moments = [
  { date: '01 Feb 2018', time: '',         type: '🍑', title: 'plant peach tree',  action: 'n', event: '' },
  { date: '04 Feb 2018', time: '04:00:00', type: '🍉', title: 'eat watermelon',  action: 'n', event: '' },
  { date: '05 Feb 2018', time: '',         type: '🍐', title: 'boil pear',   action: 'n', event: '' },
  { date: '05 Feb 2018', time: '',         type: '🍌', title: 'peel banana', action: 'n', event: '' }
];

const dates = ['02 Feb 2018', '03 Feb 2018', '04 Feb 2018'];

test.beforeEach(t => {
  t.context.worker = rewire('../../src/worker/reminder-report-worker');
  t.context.sandbox = sinon.createSandbox();

  const { worker, sandbox } = t.context;

  t.context.sheetApiMock  = sandbox.mock(SheetApi);

  constants.file =  './sample/google.json';
  constants.secretFile = './sample/reminder.json';
  worker.__set__('constants', constants);
});

test.afterEach.always(t => {
  t.context.sandbox.restore();
});

const group = [
  'do something',
  'do nothing',
  ''
];

test('stringify returns today', async t => {
  const expected = `Today,15 Aug \n${group[0]}`;
  const bind = t.context.worker._stringify.bind(group);
  const actual = bind('15 Aug 2018', 0);

  t.is(expected, actual);
});

test('stringify return empty string if no row', async t => {
  const expected = '15 Aug \ndo nothing';
  const bind = t.context.worker._stringify.bind(group);
  const actual = bind('15 Aug 2018', 1);
  t.is(expected, actual);
});

test('stringify return empty string if no row', async t => {
  const expected = '';
  const bind = t.context.worker._stringify.bind(group);
  const actual = bind('15 Aug 2018', 2);
  t.is(expected, actual);
});

test('_stringifyReminder works', async t => {
  const expected = ' type  title';
  const actual = t.context.worker._stringifyReminder({ type: 'type', title: 'title' });

  t.is(expected, actual);
});

test('init() returns config', async t => {
  const expected = {
    title: constants.reportTitle,
    task: {
      token: './sample/google.json',
      permission: [ 'https://www.googleapis.com/auth/spreadsheets.readonly' ],
      spreadsheetId: '<reminder_sheet_id>',
      range: 'Task!B2:E'
    },
    moment: {
      token: './sample/google.json',
      permission: [ 'https://www.googleapis.com/auth/spreadsheets.readonly' ],
      spreadsheetId: '<reminder_sheet_id>',
      range: 'Moment!B2:E'
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
  t.is(arrayToHash.bind.calledWithExactly(constants.task.fields), true);
});

const list = [
  'Today,02 Feb \n 🍎  bite apple\n 🍊  squeeze orange',
  '',
  '04 Feb \n 🍍  cut pineapple\n 🍓  wash strawberry\n 🍉  eat watermelon'
];

test('execute() works', async t => {
  const { worker, sheetApiMock } = t.context;
  const settings = {
    config: {
      rateKey: 'rateKey',
      task: 'task',
      moment: 'moment'
    },
    transform: () => {},
    transformCode: () => {},
  };

  sheetApiMock
    .expects('read')
    .withExactArgs('task', settings.transform)
    .once()
    .returns(tasks);

  sheetApiMock
    .expects('read')
    .withExactArgs('moment',  settings.transform)
    .once()
    .returns(moments);

  const actual = await worker.execute(settings, dates);

  t.true(sheetApiMock.verify());
  t.deepEqual(list, actual);
});
