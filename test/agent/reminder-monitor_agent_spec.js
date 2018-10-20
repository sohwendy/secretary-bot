import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');

test.beforeEach(t => {
  t.context.agent = rewire('../../src/agent/reminder-monitor-agent');
  t.context.sandbox = sinon.createSandbox();
});

test.afterEach(t => {
  t.context.sandbox.restore();
});

test('fetch works',  async t => {
  const { sandbox, agent } = t.context;

  const expected = 'fetched';
  const worker = {};
  const today = '02 Feb 2018';
  const time = '08:10:00';
  const agentMock = { fetch: sandbox.stub() };
  agent.__set__('Agent', agentMock);

  agentMock.fetch
    .withArgs(worker, 'category', { date:today, time })
    .returns(Promise.resolve(expected));

  const actual = await agent.fetch(worker, 'category', today, time);

  t.is(expected, actual);
  t.is(agentMock.fetch.callCount, 1);
});
