const moment = require('moment');
const constants = require('../../config/constants');

function _stringify(list) {
  return list.reduce((m, r) => `${m || ''}${r.type}   ${r.title}\n`, '');
}

function _filter(row) {
  const date = moment(`${row[0]} ${row[1]}`, constants.alert.dateFormat);
  const duration = moment(date).diff(this, 'minute');
  return (duration >= constants.alert.min && duration <= constants.alert.max);
}

function _formatIntoJson(row) {
  return { type: row[2], title: row[3] };
}

module.exports = {
  _filter: _filter,
  _formatIntoJson: _formatIntoJson,
  _stringify: _stringify,
  parse: ({ data, link }) => {
    if (data.length === 0) return '';
    const today = moment();
    // const today = moment('26 Mar 2018 08:44:00', constants.alert.dateFormat);
    const filteredList = data.filter(_filter, today);
    const formattedList = filteredList.map(_formatIntoJson);
    const events = _stringify(formattedList);

    return events ? `${constants.alert.title} ${formattedList.length}\n${events}\n${link || ''}` : '';
  }
};
