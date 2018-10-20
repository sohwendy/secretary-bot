function _rowToHash(row, keys) {
  return row.reduce((json, field, index) => {
    let value;
    if (!keys[index]) {
      return json;
    }

    if (['time', 'date'].includes(keys[index])) {
      value = field;
    } else {
      value = Number.parseFloat(field);
      value = Number.isNaN(value) ? field : value;
    }
    return Object.assign(json, { [keys[index]]: value });
  }, {});
}

// flatten matrix aka 2d array to simple array
function _combineRows(matrix) {
  const rowLength = matrix.length;
  const colLength = matrix[0].length;

  const result = [];
  for (let i = 0; i < rowLength; i ++) {
    for(let j = 0; j < colLength; j ++) {
      result[j] = Object.assign(result[j] || {}, matrix[i][j]);
    }
  }
  return result;
}

// create nested array within row so that each nested can be converted to hash
function _chunkArray(row, size) {
  const result = [];
  for (let i = 0; i < row.length; i += size){
    result.push(row.slice(i, i + size));
  }
  return result;
}

// converts array to hash
function arrayToHash(row, keys) {
  keys = keys || this;
  return row.map(item => _rowToHash(item, keys));
}

function hashToArray(row, keys) {
  keys = keys || this;
  return keys.map(key => row[key]);
}


function hashToMatrix(hash, keys, initial = []) {
  return hash.reduce((array, hashRow) => {
    const arrayRow = hashToArray(hashRow, keys);
    return array.concat([arrayRow]);
  }, initial);
}

function matrixToHash(matrix, keys) {
  keys = keys || this;
  const size = keys[0].length;
  const chunkMatrix = matrix.map(row => _chunkArray(row, size));
  const hash = chunkMatrix.map((row, i) => arrayToHash(row, keys[i]));
  const result = _combineRows(hash);
  return result;
}

// returns (left+right) if left has matching right values
function leftJoin(leftHashList, rightHashList, key = 'code') {
  const result = leftHashList.reduce((acc, left) => {
    const right = rightHashList.find(right => right[key] === left[key]);
    right ? acc.push(Object.assign(left, right)) : '';
    return acc;
  }, []);
  return result;
}


module.exports = {
  _combineRows,
  _chunkArray,
  _rowToHash,
  arrayToHash,
  hashToArray,
  matrixToHash,
  hashToMatrix,
  leftJoin
};
