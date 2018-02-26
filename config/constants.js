module.exports = {
  secretPath: {
    real: '../secrets',
    fake: '../sample'
  },
  alert: {
    min: 0,
    max: 15,
    title: '\u266B Get Ready...',
    dateDisplay: 'DD MMM ddd',
    dateFormat: 'DD MMM YYYY HH:mm:ss',
  },
  notification: {
    dateFormat: 'DD MMM YYYY',
    dateDisplay: 'DD MMM ddd',
    title: 'Coming up...',
    noEvent: 'No events',
    min: 0,
    max: 2
  },
  forex: {
    title: '🌎 🤑...',
    data: [
      { code: 'USD', buyUnit: 1, sellUnit: 1 },
      { code: 'MYR', buyUnit: 1, sellUnit: 1 },
      { code: 'CNY', buyUnit: 1, sellUnit: 1 },
      { code: 'AUD', buyUnit: 1, sellUnit: 1 },
      { code: 'THB', buyUnit: 1, sellUnit: 100 },
      { code: 'JPY', buyUnit: 1, sellUnit: 1000 },
      { code: 'TWD', buyUnit: 1, sellUnit: 100 },
      { code: 'KRW', buyUnit: 1, sellUnit: 1000 },
      { code: 'GBP', buyUnit: 1, sellUnit: 1 },
      { code: 'EUR', buyUnit: 1, sellUnit: 1 },
      { code: 'CHF', buyUnit: 1, sellUnit: 1 }
    ]
  }
};
