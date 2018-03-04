import test from 'ava';

const rewire = require('rewire');

const sheetApiMock = {
  get: () => {
    return [
      ['02 Feb 2018', '08:10:00', '02', 'apple', 'n'],
      ['02 Feb 2018', '', '02', 'orange', 'n'],
      ['04 Feb 2018', '04:00:00', '04', 'jackfruit', 'n'],
      ['04 Feb 2018', '15:00:00', '04', 'strawberry', 'n'],
      ['05 Feb 2018', '08:10:00', '05', 'durian', 'n'],
    ];
  }
};

const exceptionMock = () => {
  throw 'this is an exception';
};
const log = () => {};

const dates = ['02 Feb 2018', '03 Feb 2018', '04 Feb 2018'];

let job;
test.before(() => {
  job = rewire('../../src/job/reminder-report-job');
  job.__set__('SheetApi', sheetApiMock);
});

test('rule works', async t => {
  const expected = true;
  const bind = job._rule.bind(['foo', 'bar', 'baz']);
  const actual = bind({date: 'baz'});

  t.is(expected, actual);
});

test('stringify works', async t => {
  const expected = '1) date\nmsg';
  const actual = job._stringify({count: 1, date: 'date', msg: 'msg'});

  t.is(expected, actual);
});

test('stringify return empty string if no row', async t => {
  const expected = '';
  const actual = job._stringify({count: 0, date: 'date', msg: 'msg'});

  t.is(expected, actual);
});

test('stringify return empty string if no row', async t => {
  const expected = 'type   title';
  const actual = job._stringifyReminder({type: 'type', title: 'title'});

  t.is(expected, actual);
});

test('fetch works', async t => {
  const expected = '📆 Coming up...\n' +
    '```\n' +
    '2) Today, 02 Feb \n' +
    '2   apple\n' +
    '2   orange\n' +
    // '\n' +
    '2)  04 Feb \n' +
    '4   jackfruit\n' +
    '4   strawberry\n' +
    '```\n' +
    '<some_link>';

  const actual = await job.fetch(dates, {log, fake: true});

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  job.__set__('SheetApi', exceptionMock);

  const expected = '';
  const actual = await job.fetch('one', {log, fake: true});

  t.is(expected, actual);
});
