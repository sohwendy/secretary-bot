function mergeJsonUsingKey(row) {
  const rawPriceJson = this;
  const price = rawPriceJson[row.code];
  return price ? Object.assign(row, { price }) : {};
}

function mergeJsonUsingKeyValue(rule) {
  const fullItem = this;
  let item = fullItem.find(i => i.code === rule.code);
  return item ? Object.assign(rule, item) : {};
}

function toJson(values, keys) {
  return values.reduce((json, field, index) => {
    let value;
    if (['time', 'date'].includes(keys[index])) {
      value = field;

    } else {
      value = Number.parseFloat(field);
      value = Number.isNaN(value) ? field : value;
    }
    return Object.assign(json, { [keys[index]]: value });
  }, {});
}

module.exports.mergeJsonUsingKey = mergeJsonUsingKey;
module.exports.mergeJsonUsingKeyValue = mergeJsonUsingKeyValue;
module.exports.toJson = toJson;
