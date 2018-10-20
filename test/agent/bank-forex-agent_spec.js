import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');

test.beforeEach(t => {
  t.context.agent = rewire('../../src/agent/bank-forex-agent');
  t.context.sandbox = sinon.createSandbox();
});

test.afterEach(t => {
  t.context.sandbox.restore();
});

test('fetch works',  async t => {
  const { sandbox, agent } = t.context;

  const config = { title: 'title' };
  const write = { fields: 'fields' };
  const dummyConstant = { category: { config, write } };

  agent.__set__('Constants', dummyConstant);
  const expected = 10;

  const others = {};
  const initStub = sandbox.stub();
  initStub
    .withArgs(dummyConstant.category)
    .returns(Promise.resolve({ config }));

  const executeStub = sandbox.stub();
  executeStub
    .withArgs({config, ...write})
    .returns(Promise.resolve(expected));

  const worker = { init: initStub, execute: executeStub };

  const actual = await agent.update(worker, 'category', others);

  t.is(expected, actual);
});

test('update handles exception', async t => {
  const expected = 0;
  const actual = await t.context.agent.update({});

  t.is(expected, actual);
});

