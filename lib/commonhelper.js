function _getSecrets(secretPath, fake, type) {
  return `${secretPath[ fake ? 'fake' : 'real']}/${type}`;
}

module.exports._getSecrets = _getSecrets;
