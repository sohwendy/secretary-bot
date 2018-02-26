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

module.exports = {
  _filter: _filter,
  _stringify: _stringify,
  parse: ({ data }) => {
    if (!data || data.length === 0) return '';

    const forex = constants.forex.data;
    const factor = data['SGD'];
    const filteredlist = forex.map(_filter, { factor, data });
    const list = filteredlist.map( _stringify);

    return `${constants.forex.title}\n\n${list.join('\n')}`;
  }
};
