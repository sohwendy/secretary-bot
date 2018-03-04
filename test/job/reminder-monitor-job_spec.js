import test from 'ava';

const rewire = require('rewire');
const constants = require('../../config/constants');

const sheetData = [
  ['02 Feb 2018', '08:10:00', '02', 'apple', 'n'],
  ['02 Feb 2018', '', '02', 'orange', 'n'],
  ['04 Feb 2018', '04:00:00', '04', 'jackfruit', 'n'],
  ['04 Feb 2018', '04:20:00', '04', 'grapefruit', 'n'],
  ['04 Feb 2018', '15:00:00', '04', 'strawberry', 'n'],
  ['03 Feb 2018', '08:10:00', '05', 'durian', 'n'],
];
const sheetApiMock = {get: () => sheetData};

const exceptionMock = () => {
  throw 'this is an exception';
};

const log = () => {};


let job;
test.before(() => {
  job = rewire('../../src/job/reminder-monitor-job');
  job.__set__('SheetApi', sheetApiMock);
});

test('rule works', async t => {
  const expected = true;
  const bind = job._rule.bind({date: '04 Feb 2018', time: '08'});
  const actual = bind({date: '04 Feb 2018', time: '08:20:00'});

  t.is(expected, actual);
});

test('rule returns false for non-matching date', async t => {
  const expected = false;
  const bind = job._rule.bind({date: '04 Feb 2018', time: '08'});
  const actual = bind({date: '14 Feb 2018', time: '08:20:00'});

  t.is(expected, actual);
});

test('rule returns false for non-matching  time', async t => {
  const expected = false;
  const bind = job._rule.bind({date: '04 Feb 2018', time: '08'});
  const actual = bind({date: '04 Feb 2018', time: '04:08:00'});

  t.is(expected, actual);
});

test('stringify works', async t => {
  const expected = 'type   title';
  const actual = job._stringify({type: 'type', title: 'title'});

  t.is(expected, actual);
});

test('fetch works', async t => {
  const expected = constants.reminder.monitorTitle +
    '\n' +
    '```\n' +
    '4   jackfruit\n' +
    '4   grapefruit\n' +
    '```\n';
  const actual = await job.fetch('04 Feb 2018', '04', {log, fake: true});

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  job.__set__('SheetApi', exceptionMock);

  const expected = '';
  const actual = await job.fetch('one', 'b', {log, fake: true});

  t.is(expected, actual);
});
