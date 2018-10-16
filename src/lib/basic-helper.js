function roundDown(value, precision = 3) {
  const factor = Math.pow(10, precision);
  return Math.floor(value * factor) / factor;
}

function roundUp(value, precision = 3) {
  const factor = Math.pow(10, precision);
  return Math.ceil(value * factor) / factor;
}

function round(value, precision = 3) {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

function calculateExchangeRateWithUnit(row) {
  const factor = this;
  let buyRate = roundDown(row.price / factor * row.buyUnit);
  if (buyRate > 100)
    buyRate = round(buyRate, 1);
  const sellRate = roundUp(factor / row.price * row.sellUnit);
  return Object.assign(row, { buyRate, sellRate });
}

function calculateUnit(row) {
  let buyRate = roundDown(row.price / row.buyUnit);
  if (buyRate > 100)
    buyRate = round(buyRate, 1);
  const sellRate = roundUp(1 / row.price * row.sellUnit);
  return Object.assign(row, { buyRate, sellRate });
}

function calculateExchangeRate(foreign, local) {
  return foreign / local;
}

function pad(value, padding = 7) {
  return value.toString().padStart(padding);
}

function displayChat(list, title, link) {
  const codeBlock = '```';
  return list.length ? `${title}\n${codeBlock}\n${list.join('\n')}\n${codeBlock}\n${link || ''}` : '';
}

module.exports.pad = pad;
module.exports.displayChat = displayChat;
module.exports.calculateExchangeRateWithUnit = calculateExchangeRateWithUnit;
module.exports.roundDown = roundDown;
module.exports.roundUp = roundUp;
module.exports.round = round;
module.exports.calculateExchangeRate = calculateExchangeRate;
module.exports.calculateUnit = calculateUnit;
