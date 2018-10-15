import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');
const stub = require('../_stub');

const sheetData = [
  { date: '02 Feb 2018', time: '08:10:00', type: '02', title: 'apple',      action: 'n', event: '' },
  { date: '02 Feb 2018', time: '',         type: '02', title: 'orange',     action: 'n', event: '' },
  { date: '04 Feb 2018', time: '04:00:00', type: '04', title: 'jackfruit',  action: 'n', event: '' },
  { date: '04 Feb 2018', time: '04:00:00', type: '04', title: 'grapefruit',  action: 'n', event: '' },
  { date: '04 Feb 2018', time: '15:00:00', type: '14', title: 'strawberry', action: 'n', event: '' },
  { date: '05 Feb 2018', time: '08:10:00', type: '05', title: 'durian',     action: 'n', event: '' }
];
const sheetApiMock = { read: () => sheetData };

let job;
let sandbox;
let constants;
test.beforeEach(() => {
  job = rewire('../../src/job/reminder-monitor-job');
  job.__set__('SheetApi', sheetApiMock);

  sandbox = sinon.createSandbox();

  constants = require('../../config/constants');
});

test.afterEach.always(() => {
  sandbox.restore();
});


test('rule works', async t => {
  const expected = true;
  const bind = job._rule.bind({ date: '04 Feb 2018', time: '08' });
  const actual = bind({ date: '04 Feb 2018', time: '08:20:00' });

  t.is(expected, actual);
});

test('rule returns false for non-matching date', async t => {
  const expected = false;
  const bind = job._rule.bind({ date: '04 Feb 2018', time: '08' });
  const actual = bind({ date: '14 Feb 2018', time: '08:20:00' });

  t.is(expected, actual);
});

test('rule returns false for non-matching  time', async t => {
  const expected = false;
  const bind = job._rule.bind({ date: '04 Feb 2018', time: '08' });
  const actual = bind({ date: '04 Feb 2018', time: '04:08:00' });

  t.is(expected, actual);
});

test('stringify works', async t => {
  const expected = 'type   title';
  const actual = job._stringify({ type: 'type', title: 'title' });

  t.is(expected, actual);
});

test('fetch works', async t => {
  const expected = constants.reminder.monitorTitle +
    '\n' +
    '```\n' +
    '04   jackfruit\n' +
    '04   grapefruit\n' +
    '```\n';
  const actual = await job.fetch('04 Feb 2018', '04');

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  job.__set__('SheetApi', stub.exceptionMock);

  const expected = '';
  const actual = await job.fetch('one', 'b');

  t.is(expected, actual);
});
