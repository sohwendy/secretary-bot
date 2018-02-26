function roundDown(value, precision = 3) {
  const factor = Math.pow(10, precision);
  return Math.floor(value * factor) / factor;
}

function roundUp(value, precision = 3) {
  const factor = Math.pow(10, precision);
  return Math.ceil(value * factor) / factor;
}

function pad(value, padding = 5) {
  return value.toString().padStart(padding);
}

module.exports.roundDown = roundDown;
module.exports.roundUp = roundUp;
module.exports.pad = pad;
