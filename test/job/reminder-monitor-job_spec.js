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
  t.context.job = rewire('../../src/job/reminder-monitor-job');
  t.context.sandbox = sinon.createSandbox();

  const { job, sandbox } = t.context;

  t.context.sheetApiMock  = sandbox.mock(SheetApi);

  constants.file =  './sample/google.json';
  constants.secretFile =  './sample/forex.json';

  job.__set__('constants', constants);
});

test.afterEach.always(t => {
  t.context.sandbox.restore();
});

test('rule works', async t => {
  const expected = true;
  const bind = t.context.job._rule.bind({ date: '04 Feb 2018', time: '08' });
  const actual = bind({ date: '04 Feb 2018', time: '08:20:00' });

  t.is(expected, actual);
});

test('rule returns false for non-matching date', async t => {
  const expected = false;
  const bind = t.context.job._rule.bind({ date: '04 Feb 2018', time: '08' });
  const actual = bind({ date: '14 Feb 2018', time: '08:20:00' });

  t.is(expected, actual);
});

test('rule returns false for non-matching  time', async t => {
  const expected = false;
  const bind = t.context.job._rule.bind({ date: '04 Feb 2018', time: '08' });
  const actual = bind({ date: '04 Feb 2018', time: '04:08:00' });

  t.is(expected, actual);
});

test('stringify works', async t => {
  const expected = 'type   title';
  const actual = t.context.job._stringify({ type: 'type', title: 'title' });

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

  const actual = await t.context.job.Worker.init(constants);

  t.deepEqual(expected, actual.config);
});

test('init() returns transform', async t => {
  const { job, sandbox } = t.context;

  const arrayToHash = { bind: sandbox.stub() };

  job.__set__('arrayToHash', arrayToHash);

  await job.Worker.init(constants);

  t.is(arrayToHash.bind.callCount, 1);
  t.is(arrayToHash.bind.calledWithExactly(constants.fields), true);
});


const list = [
  '04   cut jackfruit',
  '04   pluck grapefruit'
];

test('execute() works', async t => {
  const { job, sheetApiMock } = t.context;
  const settings = {
    config: {
      task: 'task',
    },
    transform: () => {},
  };

  sheetApiMock
    .expects('read')
    .withExactArgs('task', settings.transform)
    .once()
    .returns(sheetData);

  const bind = job._rule.bind({ date: '04 Feb 2018', time: '04' });

  const actual = await job.Worker.execute(settings, bind);

  t.true(sheetApiMock.verify());
  t.deepEqual(list, actual);
});

test('fetch works', async t => {
  const expected = constants.monitorTitle +
    '\n' +
    '```\n' +
    list.join('\n') +
    '\n' +
    '```\n';
  const { sandbox, job } = t.context;
  sandbox.stub(job.Worker, 'init').returns({
    config: {
      title: constants.monitorTitle
    }
  });
  sandbox.stub(job.Worker, 'execute').returns(list);

  const actual = await job.fetch('04 Feb 2018', '04');

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  const expected = '';
  const actual = await t.context.job.fetch('one', 'b');

  t.is(expected, actual);
});
