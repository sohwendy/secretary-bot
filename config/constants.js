module.exports = {
  secretPath: file => `.secrets/${file}`,
  reminder: {
    reportTitle: '📆 Coming up...',
    monitorTitle: '📆🔥 Get Ready...',
    file: './.secrets/google.json',
    secretFile: './.secrets/reminder.json',
    permission: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    link: '[update \u2667](http://bit.ly/sheet_reminders)',
    task: {
      range: 'Task!B2:E',
      fields: ['date', 'time', 'type', 'title', 'action', 'event']
    },
    moment: {
      range: 'Moment!B2:E',
      fields: ['date', 'time', 'type', 'title', 'action', 'event']
    }
  },
  forex: {
    reportTitle: '🌎 Left - more is gd, Right - less is gd...',
    monitorTitle: '🌎🔥 Left - more is gd, Right - less is gd...',
    file: './.secrets/google.json',
    rateSecretFile: './.secrets/oer.json',
    secretFile: './.secrets/forex.json',
    code: {
      range: 'ForexCode!B2:F',
      fields: ['code', 'buyUnit', 'sellUnit', 'watchlist', 'mca' ]
    },
    permission: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    rule: {
      range: 'ForexRule!B2:G',
      fields: ['code', 'buysell', 'min', 'max', 'message', 'done']
    }
  },
  bankforex: {
    file: './.secrets/google.json',
    secretFile: './.secrets/bankforex.json',
    read: {
      range: 'Bank!B2:AK4',
      fields: [
        ['id', '', ''],
        ['code', '', ''],
        ['buyRate', 'sellRate', '']
      ]
    },
    permission: ['https://www.googleapis.com/auth/spreadsheets'],
    write: {
      range: 'Bank!A6:AK',
      fields: ['sellPrice', 'buyTTPrice', 'buyODPrice']
    }
  },
  stock: {
    reportTitle: '👵 Retirement Nest',
    monitorTitle: '👵🔥 Action?!',
    file: './.secrets/google.json',
    secretFile: './.secrets/stock.json',
    permission: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    code: {
      range: 'StockCode!A2:D',
      fields: ['code', 'name', 'suffix', 'short']
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
      bank: {
        report: '37 25 10,4 * * 1-5',
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
        report: '25 */14 * * * *',
        monitor: '35 */12 * * * *'
      },
      stock: {
        report: '45 0,30 * * * *',
        monitor: '55 15,45 * * * *'
      },
      bank: {
        report: '37 */20 * * * *',
      },
      log: {
        monitor: '00 */1 * * * *'
      }
    }
  }
};
