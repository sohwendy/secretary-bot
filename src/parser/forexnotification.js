const constants = require('../../config/constants');

function _stringify(row) {
  const foreign = row.code.toLowerCase();
  const buyRate = row.buyRate.toString().padStart(5);
  const sellRate = row.sellRate.toString().padStart(5);
  const sellUnit = row.sellUnit.toString().padStart(5);

  return `${row.buyUnit} sgd to ${foreign}  ${buyRate}  ${sellUnit} ${foreign} to sgd  ${sellRate}`;
}

function _filter(row) {
  const { factor, data } = this;
  const buyRate = _round(data[row.code] / factor * row.buyUnit);
  const sellRate = _round(factor / data[row.code] * row.sellUnit);
  return { code: row.code, buyRate, sellRate, buyUnit: row.buyUnit, sellUnit: row.sellUnit};
}

function _round(value) {
  const factor = Math.pow(10, 2);
  return Math.round(value * factor) / factor;
}

module.exports = {
  _filter: _filter,
  _stringify: _stringify,
  parse: ({ data }) => {
    if (data.length === 0) return '';

    const forex = constants.forex.data;
    const factor = data['SGD'];
    const filteredlist = forex.map(_filter, { factor, data });
    const list = filteredlist.map( _stringify);

    return `${constants.forex.title}\n\n${list.join('\n')}`;
  }
};
