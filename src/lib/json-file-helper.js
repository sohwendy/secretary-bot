const { promisify } = require('util');
const fs = require('fs');

const readFile = promisify(fs.readFile);

module.exports = {
  get: async(file, logger) => {
    try {
      const content = await readFile(file);
      return JSON.parse(content);
    } catch (e) {
      logger('Failed to read json file', e);
    }
    return {};
  }
};
