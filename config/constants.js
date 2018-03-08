module.exports = {
  secretPath: (fake, file) => {
    /* istanbul ignore next */
    return `${fake ? 'sample' : '.secrets'}/${file}`;
  },
  reminder: {
    reportTitle: '📆 Coming up...',
    monitorTitle: '📆🔥 Get Ready...',
    file: './.secrets/google.json',
    scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    range: 'Remind!B2:E',
    link: '[update \u2667](http://bit.ly/sheet_reminders)',
    fields: ['date', 'time', 'type', 'title', 'action', 'event']
  },
  forex: {
    reportTitle: '🌎 Left - more is gd, Right - less is gd...',
    monitorTitle: '🌎🔥 Left - more is gd, Right - less is gd...',
    file: './.secrets/google.json',
    code: {
      range: 'ForexCode!B2:F',
      fields: ['code', 'buyUnit', 'sellUnit', 'watchlist', 'mca' ]
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
    file: './.secrets/google.json',
    scope: ['https://www.googleapis.com/auth/spreadsheets'],
    code: {
      range: 'StockCode!A2:C',
      fields: ['code', 'name', 'suffix']
    },
    rule: {
      range: 'StockRule!B2:G',
      fields: ['name', 'code', 'min', 'max', 'message', 'done']
    }
  },
  schedule: {
    live: {
      reminder: {
        report: '15 48 8 * * *',
        monitor: '15 0 9-22/1 * * *'
      },
      forex: {
        report: '30 48 10 * * 1-6',
        monitor: '30 48 11-20/4 * * 1-5'
      },
      stock: {
        report: '45 10 9 * * 1-6',
        monitor: '45 10 10-5/1 * * 1-5'
      },
      log: {
        monitor: '00 */10 * * * *'
      }
    },
    debug: {
      reminder: {
        report: '5 */6 * * * *',
        monitor: '15 */3 * * * *'
      },
      forex: {
        report: '25 */4 * * * *',
        monitor: '35 */2 * * * *'
      },
      stock: {
        report: '45 */15 * * * *',
        monitor: '55 */4 * * * *'
      },
      log: {
        monitor: '00 */1 * * * *'
      }
    }
  }
};
