const { promisify } = require('util');
const fs = require('fs');
const Logger = require('../lib/log-helper');

const readFile = promisify(fs.readFile);

module.exports = {
  get: async(file) => {
    try {
      const content = await readFile(file);
      return JSON.parse(content);
    } catch (e) {
      Logger.log('Failed to read json file', e);
    }
    return {};
  }
};
