module.exports = {
  secretPath: (fake, file) => {
    /* istanbul ignore next */
    return `../../${fake ? 'sample' : 'secrets'}/${file}`;
  },
  reminder: {
    reportTitle: '📆 Coming up...',
    monitorTitle: '📆🔥 Get Ready...',
  },
  forex: {
    reportTitle: '🌎 Left - more is gd, Right - less is gd...',
    monitorTitle: '🌎🔥 Left - more is gd, Right - less is gd...'
  },
  stock: {
    reportTitle: '👵 Retirement Nest',
    monitorTitle: '👵🔥 Action?!'
  }
};
