import test from 'ava';
import sinon from 'sinon';

const rewire = require('rewire');
const stub = require('../_stub');

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

const sheetApiMock = {
  get: (_a, _b, c) => {
    return c.range === 'Task!B2:E' ? tasks : moments;
  }
};

const exceptionMock = () => { throw 'this is an exception'; };
const dates = ['02 Feb 2018', '03 Feb 2018', '04 Feb 2018'];

let job;
let sandbox;
let constants;

test.beforeEach(() => {
  job = rewire('../../src/job/reminder-report-job');
  job.__set__('SheetApi', sheetApiMock);
  sandbox = sinon.createSandbox();

  constants = require('../../config/constants');
  constants.secretPath = sandbox.stub().callsFake(stub.secretPath);
});

test.afterEach.always(() => {
  sandbox.restore();
});

test('rule works', async t => {
  const expected = true;
  const bind = job._rule.bind(['foo', 'bar', 'baz']);
  const actual = bind({ date: 'baz' });

  t.is(expected, actual);
});

test('stringify works', async t => {
  const expected = '1) date\nmsg';
  const actual = job._stringify({ count: 1, date: 'date', msg: 'msg' });

  t.is(expected, actual);
});

test('stringify return empty string if no row', async t => {
  const expected = '';
  const actual = job._stringify({ count: 0, date: 'date', msg: 'msg' });

  t.is(expected, actual);
});

test('stringify return empty string if no row', async t => {
  const expected = ' type  title';
  const actual = job._stringifyReminder({ type: 'type', title: 'title' });

  t.is(expected, actual);
});

test('fetch works', async t => {
  const expected = '📆 Coming up...\n' +
    '```\n' +
    '2) Today, 02 Feb \n' +
    ' 🍎  bite apple\n' +
    ' 🍊  squeeze orange\n' +
    // '\n' +
    '3)  04 Feb \n' +
    ' 🍍  cut pineapple\n' +
    ' 🍓  wash strawberry\n' +
    ' 🍉  eat watermelon\n' +
    '```\n' +
    '[update ♧](<some_url>)';

  const actual = await job.fetch(dates);

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  job.__set__('SheetApi', exceptionMock);

  const expected = '';
  const actual = await job.fetch('one');

  t.is(expected, actual);
});
