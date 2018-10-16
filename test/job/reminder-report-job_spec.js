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
  t.context.job = rewire('../../src/job/reminder-report-job');
  t.context.sandbox = sinon.createSandbox();

  const { job, sandbox } = t.context;

  t.context.sheetApiMock  = sandbox.mock(SheetApi);

  constants.file =  './sample/google.json';
  constants.secretFile = './sample/reminder.json';
  job.__set__('constants', constants);
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
  const bind = t.context.job._stringify.bind(group);
  const actual = bind('15 Aug 2018', 0);

  t.is(expected, actual);
});

test('stringify return empty string if no row', async t => {
  const expected = '15 Aug \ndo nothing';
  const bind = t.context.job._stringify.bind(group);
  const actual = bind('15 Aug 2018', 1);
  t.is(expected, actual);
});

test('stringify return empty string if no row', async t => {
  const expected = '';
  const bind = t.context.job._stringify.bind(group);
  const actual = bind('15 Aug 2018', 2);
  t.is(expected, actual);
});

test('_stringifyReminder works', async t => {
  const expected = ' type  title';
  const actual = t.context.job._stringifyReminder({ type: 'type', title: 'title' });

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

  const actual = await t.context.job.Worker.init(constants);

  t.deepEqual(expected, actual.config);
});

test('init() returns transform', async t => {
  const { job, sandbox } = t.context;

  const arrayToHash2 = { bind: sandbox.stub() };

  job.__set__('arrayToHash2', arrayToHash2);

  await job.Worker.init(constants);

  t.is(arrayToHash2.bind.callCount, 1);
  t.is(arrayToHash2.bind.calledWithExactly(constants.task.fields), true);
});

const list = [
  'Today,02 Feb \n 🍎  bite apple\n 🍊  squeeze orange',
  '',
  '04 Feb \n 🍍  cut pineapple\n 🍓  wash strawberry\n 🍉  eat watermelon'
];

test('execute() works', async t => {
  const { job, sheetApiMock } = t.context;
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
    .expects('read2')
    .withExactArgs('task', settings.transform)
    .once()
    .returns(tasks);

  sheetApiMock
    .expects('read2')
    .withExactArgs('moment',  settings.transform)
    .once()
    .returns(moments);

  const actual = await job.Worker.execute(settings, dates);

  t.true(sheetApiMock.verify());
  t.deepEqual(list, actual);
});

test('fetch works', async t => {
  const expected = '📆 Coming up...\n' +
    '```\n' +
    list.join('\n') +
    '\n'+
    '```\n';

  const { sandbox, job } = t.context;
  sandbox.stub(job.Worker, 'init').returns({ config: {title: constants.reportTitle }});
  sandbox.stub(job.Worker, 'execute').returns(list);
  const actual = await job.fetch(dates);

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  const expected = '';
  const actual = await t.context.job.fetch();

  t.is(expected, actual);
});
