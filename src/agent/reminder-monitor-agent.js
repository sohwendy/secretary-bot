const Agent = require('./agent');

module.exports = {
  fetch: async(Worker, category, today, time) => {
    return await Agent.fetch(Worker, category, { date: today, time });
  }
};
