import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');
const stub = require('../_stub');

const tasks = [
  ['02 Feb 2018', '08:10:00', '02', 'apple', 'n'],
  ['02 Feb 2018', '',         '02', 'orange', 'n'],
  ['04 Feb 2018', '04:00:00', '04', 'jackfruit', 'n'],
  ['04 Feb 2018', '15:00:00', '14', 'strawberry', 'n'],
  ['05 Feb 2018', '08:10:00', '05', 'durian', 'n'],
];
const moments = [
  ['01 Feb 2018', '',         '40', 'peach', 'n'],
  ['04 Feb 2018', '04:00:00', '41', 'mango', 'n'],
  ['05 Feb 2018', '',         '42', 'pear', 'n'],
  ['06 Feb 2018', '',         '43', 'banana', 'n'],
];
const sheetApiMock = {
  read: (_a, _b, c) => {
    return c.range === 'Task!B2:E' ? tasks : moments;
  }
};

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
    ' 2  apple\n' +
    ' 2  orange\n' +
    // '\n' +
    '3)  04 Feb \n' +
    ' 4  jackfruit\n' +
    ' 14  strawberry\n' +
    ' 41  mango\n' +
    '```\n' +
    '[update ♧](<some_url>)';

  const actual = await job.fetch(dates);

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  job.__set__('SheetApi', stub.exceptionMock);

  const expected = '';
  const actual = await job.fetch('one');

  t.is(expected, actual);
});
