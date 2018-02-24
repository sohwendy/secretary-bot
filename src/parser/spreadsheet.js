const moment = require('moment');
const constants = require('../../config/constants');

module.exports = ({ data, link }) => {
  if (data.length === 0) {
    return;
  } else {
    const current = moment().startOf('day');
    // const current = moment('26 Mar 2018 08:44:00', constants.datetimeFormat);

    // filter out the events and sort into array using date difference
    // [
    //   [0]: [ { event1 of day 0 }, { event2 of day 0 } ],
    //   [1]: [ { event1 of day 1 }, { event2 of day 1 } ]
    // ]
    const list = data.reduce((list, row) => {
      const date = moment(`${row[0]} ${row[1]}`, constants.datetimeFormat);
      // const date = moment(`${row[0]} ${row[1]}`, constants.datetimeFormat);
      const day = moment(date).diff(current, 'day');

      if (day >= constants.date.min && day <= constants.date.max) {
        const remind = { type: row[2], title: row[3] };
        list[day] ? list[day].push(remind) : list[day] = [remind];
      }
      return list;
    }, []);

    // stringify per day events
    const daily = list.map(row => {
      return row.reduce((m, r) => `${m || ''}${r.type}   ${r.title}\n `, '');
    });

    // set up the dates of the events
    const subtitle = daily.map((_, index) => {
      let display = current.add(index, 'day').format(constants.dateDisplay);
      return `${list[index].length}) ${index === 0 ? 'Today' : ''} ${display}`;
    });

    // format events for chat
    const session = daily.reduce((session, c, index) => {
      const part = `${subtitle[index]}\n ${c}\n`;
      const line = session ? `${session}${part}` : `${part}`;
      return c ? line : session;
    }, '');

    return session ? `${constants.title}\n\n${session} ${link || ''}` : '';
  }
};
