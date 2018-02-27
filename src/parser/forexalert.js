const constants = require('../../config/constants');
const { roundDown, roundUp } = require('../../lib/forexhelper');

function _stringify(row) {
  return `${row.sellUnit} ${row.code} to ${row.sellRate} sgd   (${row.min}, ${row.max}) ${row.msg}`;
}

function _filter(row) {
  const { factor, data } = this;
  const { code, buyUnit, sellUnit } = row;
  if (!code || !buyUnit || !sellUnit || !data[code] || !factor)
    return { code, buyRate: '-', sellRate: '-', buyUnit: '-', sellUnit: '-' };
  const buyRate = roundDown(data[code] / factor * buyUnit);
  const sellRate = roundUp(factor / data[code] * sellUnit);
  return { code, buyRate, sellRate, buyUnit, sellUnit};
}

function _formatAlertJson(row, index) {
  const min = parseFloat(row[1]);
  const max = parseFloat(row[2]);
  index = 0;
  return { code: row[0], min, max, msg: row[3], done: row[4], index };
}

function _mergeAlert(triggers, t) {
  const rateList = this;
  const rate = rateList.find(r => r.code === t.code);
  if (rate && rate.sellRate >= t.min && rate.sellRate < t.max && t.msg) {
    triggers.push(Object.assign(t, rate));
  }
  return triggers;
}

module.exports = {
  _filter: _filter,
  _stringify: _stringify,
  _formatAlertJson: _formatAlertJson,
  _mergeAlert: _mergeAlert,
  parse: ({ data, alert }) => {
    if (!data || data.length === 0) return '';
    if (!alert || alert.length === 0) return '';

    const watchList = constants.forex.data;
    const factor = data['SGD'];

    const rateList = watchList.map(_filter, { factor, data });
    const alertList = alert.map(_formatAlertJson);
    const triggers = alertList.reduce(_mergeAlert.bind(rateList), []);
    const list = triggers.map(_stringify);

    return list && list.length ? `${constants.forex.title}\n\n${list.join('\n')}\n\n` : '';
  }
};
