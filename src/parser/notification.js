const moment = require('moment');
const constants = require('../../config/constants');

// stringify per day events
function _stringify(row) {
  return row.reduce((m, r) => `${m || ''}${r.type}   ${r.title}\n`, '');
}

// filter out the events and sort into array using date difference
// [
//   [0]: [ { event1 of day 0 }, { event2 of day 0 } ],
//   [1]: [ { event1 of day 1 }, { event2 of day 1 } ]
// ]
function _filterAndFormat(data, today) {
  return data.reduce((list, row) => {
    const date = moment(`${row[0]} ${row[1]}`, constants.notification.dateFormat);
    const day = moment(date).diff(today, 'day');

    if (day >= constants.notification.min && day <= constants.notification.max) {
      const remind = { type: row[2], title: row[3] };
      list[day] ? list[day].push(remind) : list[day] = [remind];
    }
    return list;
  }, []);
}

function _formatContent(dayEvents, dateHeaders) {
  const perDay = dayEvents.map((day, index) => `${dateHeaders[index]}\n${day}`);
  return perDay.filter(day => day).join('\n');
}

function _createHeader(row, index) {
  const today = this;
  let display = today.clone().add(index, 'day').format(constants.notification.dateDisplay);
  return `${row.length}) ${index === 0 ? 'Today' : ''} ${ display}`;
}

module.exports = {
  _stringify: _stringify,
  _createHeader: _createHeader,
  _filterAndFormat: _filterAndFormat,
  _formatContent: _formatContent,
  parse: ({ data, link }) => {
    if (data.length === 0) return '';

    const today = moment().startOf('day');
    // const today = moment('26 Mar 2018 08:44:00', constants.notification.datetimeFormat);

    const list = _filterAndFormat(data, today);
    const dayEvents = list.map(row => _stringify(row));
    if (dayEvents.length === 0) return constants.notification.noEvent;
    const dateHeaders = list.map(_createHeader, today);
    const chat = _formatContent(dayEvents, dateHeaders);

    return `${constants.notification.title}\n\n${chat}\n${link || ''}`;
  }
};
