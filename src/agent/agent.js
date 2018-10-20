const Constants = require('../../config/constants');
const BasicHelper = require('../lib/basic-helper');
const Logger = require('../lib/log-helper');

module.exports = {
  fetch: async(Worker, category, others) => {
    try {
      Logger.log(`get ${Worker.name}...`);
      const constants = Constants[category];

      const settings = await Worker.init(constants);
      const results = await Worker.execute(settings, others);

      Logger.log(`send ${Worker.name}... ${results.length}`);

      return BasicHelper.displayChat(results, settings.config.title);
    } catch (error) {
      Logger.log(`cant fetch ${Worker.name}`, error);
      return '';
    }
  }
};
