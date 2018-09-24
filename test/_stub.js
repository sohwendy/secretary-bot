module.exports = {
  secretPath: f => `sample/${f}`,
  exceptionMock: () => { throw 'this is an exception'; }
};
