import test from 'ava';
import sinon from 'sinon';
const rewire = require('rewire');

test.beforeEach(t => {
  t.context.agent = rewire('../../src/agent/agent');
  t.context.sandbox = sinon.createSandbox();
});

test.afterEach(t => {
  t.context.sandbox.restore();
});

test('fetch works',  async t => {
  const { sandbox, agent } = t.context;
  const dummyConstant = {
    category: {
      config: {
        title: 'title'
      }
    }
  };

  agent.__set__('Constants', dummyConstant);
  const results = ['a', 'b'];
  const expected = dummyConstant.category.config.title +
    '\n' +
    '```\n' +
    results.join('\n') +
    '\n' +
    '```\n';

  const others = {};
  const initStub = sandbox.stub();
  initStub
    .withArgs(dummyConstant.category)
    .returns(Promise.resolve(dummyConstant.category));

  const executeStub = sandbox.stub();
  executeStub
    .withArgs(dummyConstant.category, others)
    .returns(Promise.resolve(results));

  const worker = { init: initStub, execute: executeStub };

  const actual = await agent.fetch(worker, 'category', others);

  t.is(expected, actual);
});

test('fetch handles exception', async t => {
  const expected = '';
  const actual = await t.context.agent.fetch({});

  t.is(expected, actual);
});

