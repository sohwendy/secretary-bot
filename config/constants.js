module.exports = {
  secretPath: (fake, file) => {
    /* istanbul ignore next */
    return `${fake ? 'sample' : 'secrets'}/${file}`;
  },
  reminder: {
    reportTitle: '📆 Coming up...',
    monitorTitle: '📆🔥 Get Ready...',
    file: './secrets/google.json',
    scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    range: 'Remind!A2:D',
    link: '[update \u2667](http://bit.ly/sheet_reminders)',
    fields: ['date', 'time', 'type', 'title', 'action', 'event']
  },
  forex: {
    reportTitle: '🌎 Left - more is gd, Right - less is gd...',
    monitorTitle: '🌎🔥 Left - more is gd, Right - less is gd...',
    file: './secrets/google.json',
    code: {
      range: 'ForexCode!B2:E',
      fields: ['code', 'buyUnit', 'sellUnit', 'done' ]
    },
    scope: ['https://www.googleapis.com/auth/spreadsheets'],
    rule: {
      range: 'ForexRule!B2:F',
      fields: ['code', 'min', 'max', 'message', 'done']
    }
  },
  stock: {
    reportTitle: '👵 Retirement Nest',
    monitorTitle: '👵🔥 Action?!',
    file: './secrets/google.json',
    scope: ['https://www.googleapis.com/auth/spreadsheets'],
    code: {
      range: 'StockCode!A2:C',
      fields: ['code', 'name', 'suffix']
    },
    rule: {
      range: 'StockRule!B2:G',
      fields: ['name', 'code', 'min', 'max', 'message', 'done']
    }
  }
};
