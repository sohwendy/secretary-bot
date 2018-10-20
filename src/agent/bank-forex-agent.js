const Constants = require('../../config/constants');
const Logger = require('../lib/log-helper');

module.exports = {
  update: async(Worker, category) => {
    try {
      Logger.log(`get ${Worker.name}...`);

      const constants = Constants[category];
      const fields = constants.write.fields;
      const settings = await Worker.init(constants);
      const count = await Worker.execute({ ...settings, fields});
      Logger.log(`${Worker.name} report ok... ${count}`);

      return count;
    } catch (err) {
      Logger.log(`cant fetch ${Worker.name}`, err);
      return 0;
    }
  },
};
