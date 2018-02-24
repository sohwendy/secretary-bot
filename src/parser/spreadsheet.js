const moment = require('moment');
const constants = require('../../config/constants');

// stringify per day events
function _stringifyPerDayEvents(list) {
  return list.map(row => {
    return row.reduce((m, r) => `${m || ''}${r.type}   ${r.title}\n `, '');
  });
}

// set up the dates of the events
function _createDateHeaders(dayEvents, list, today) {
  return dayEvents.map((_, index) => {
    let display = today.clone().add(index, 'day').format(constants.dateDisplay);

    return `${list[index].length}) ${index === 0 ? 'Today' : ''} ${display}`;
  });
}

// filter out the events and sort into array using date difference
// [
//   [0]: [ { event1 of day 0 }, { event2 of day 0 } ],
//   [1]: [ { event1 of day 1 }, { event2 of day 1 } ]
// ]
function _filterEvents(data, today) {
  return data.reduce((list, row) => {
    const date = moment(`${row[0]} ${row[1]}`, constants.datetimeFormat);
    // const date = moment(`${row[0]} ${row[1]}`, constants.datetimeFormat);
    const day = moment(date).diff(today, 'day');

    if (day >= constants.date.min && day <= constants.date.max) {
      const remind = { type: row[2], title: row[3] };
      list[day] ? list[day].push(remind) : list[day] = [remind];
    }
    return list;
  }, []);
}

// format events for chat
function _formatChat(dayEvents, dateHeaders) {
  return dayEvents.reduce((session, c, index) => {
    const part = `${dateHeaders[index]}\n ${c}\n`;
    const line = session ? `${session}${part}` : `${part}`;
    return c ? line : session;
  }, '');
}

module.exports = {
  _filterEvents: _filterEvents,
  _createDateHeaders: _createDateHeaders,
  _stringifyPerDayEvents: _stringifyPerDayEvents,
  _formatChat: _formatChat,
  parse: ({ data, link }) => {
    if (data.length === 0) return;

    const today = moment().startOf('day');
    // const today = moment('26 Mar 2018 08:44:00', constants.datetimeFormat);

    const list = _filterEvents(data, today);
    const dayEvents = _stringifyPerDayEvents(list);
    const dateHeaders = _createDateHeaders(dayEvents, list, today);
    const chat = _formatChat(dayEvents, dateHeaders);

    return chat ? `${constants.title}\n\n${chat} ${link || ''}` : '';
  }
};
