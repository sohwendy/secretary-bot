const constants = require('../../config/constants');
const { roundDown, roundUp } = require('../../lib/forexhelper');

function _stringify(row) {
  const foreign = row.code.toLowerCase();
  const buyRate = row.buyRate.toString().padStart(5);
  const sellRate = row.sellRate.toString().padStart(5);
  const sellUnit = row.sellUnit.toString().padStart(5);

  return `${row.buyUnit} sgd to ${foreign}  ${buyRate}  ${sellUnit} ${foreign} to sgd  ${sellRate}`;
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

function _groupAlert(array, row) {
  const condition = { min: row.min, max: row.max, msg: row.msg, done: row.done, index: row.index } ;

  if (array.length === 0) {
    array.push({code: row.code, data: [condition]});
    return array;
  }
  const index = array.findIndex(group => group.code === row.code);
  if (index >= 0) {
    let data = array[index].data;
    data.push(condition);
    data.sort((a, b) => a.min > b.min);
  } else {
    array.push({ code: row.code, data: [condition] });
  }
  return array;
}

module.exports = {
  _filter: _filter,
  _stringify: _stringify,
  _formatAlertJson: _formatAlertJson,
  _groupAlert: _groupAlert,
  parse: ({ data, alert }) => {
    if (!data || data.length === 0) return '';
    if (!alert || alert.length === 0) return '';
    const forex = constants.forex.data;
    const factor = data['SGD'];
    const filteredlist = forex.map(_filter, { factor, data });

    const formattedAlert = alert.map(_formatAlertJson);
    const groupAlert = formattedAlert.reduce(_groupAlert, []);

    const alerts = groupAlert.map(group => {
      const current = filteredlist.find(rate => rate.code === group.code);
      const filter = group.data.filter(rule => (current.sellRate >= rule.min && current.sellRate < rule.max));
      const first = filter[0]
      return filter ?
        `${current.sellUnit} ${group.code} to ${current.sellRate} sgd   (${first.min}, ${first.max}) ${first.msg}` : '';
    });

    return `${constants.forex.title}\n\n${alerts.join('\n')}\n\n`;
  }
};
