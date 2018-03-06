const cron = require('cron');
const moment = require('moment');
const TelegramBot = require('node-telegram-bot-api');
const StockReport = require('./job/stock-report-job');
const ForexReport = require('./job/forex-report-job');
const ReminderReport = require('./job/reminder-report-job');
const StockMonitor = require('./job/stock-monitor-job');
const ForexMonitor = require('./job/forex-monitor-job');
const ReminderMonitor = require('./job/reminder-monitor-job');
const Logger = require('./lib/log-helper');

const chat = require('../secrets/chat');

const schedule = {
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
};

const bot = new TelegramBot(chat.token, { polling: false });
const send = data => {
  Logger.log(data);
  /* eslint-disable */
  data ? bot.sendMessage(chat.chatId, data, { parse_mode: 'markdown' }) : '';
  /* eslint-enable */
};

debug = true;
const state = process.argv[2] || '';
Logger.log('running in state ', state);

const today = moment().startOf('day');
let dates = [];
for (let day = 0; day < 3; day++) {
  const d = today.clone().add(day, 'day').format('DD MMM YYYY');
  dates.push(d);
}
let time = moment().format('HH');

Logger.log(dates[0], time);


if (!state) {
  ReminderReport.fetch(dates, {}).then(send);
  ReminderMonitor.fetch(dates[0], time, {}).then(send);
  ForexReport.fetch({}).then(send);
  ForexMonitor.fetch({}).then(send);
  StockReport.fetch({}).then(send);
  StockMonitor.fetch({}).then(send);
} else {
  new cron.CronJob({
    cronTime: schedule[state].reminder.report,
    onTick: () => ReminderReport.fetch(dates, {}).then(send),
    start: true
  });

  new cron.CronJob({
    cronTime: schedule[state].reminder.monitor,
    onTick: () => ReminderMonitor.fetch(dates[0], time, {}).then(send),
    start: true
  });

  new cron.CronJob({
    cronTime: schedule[state].forex.report,
    onTick: () => ForexReport.fetch({}).then(send),
    start: true
  });

  new cron.CronJob({
    cronTime: schedule[state].forex.monitor,
    onTick: () => ForexMonitor.fetch({}).then(send),
    start: true
  });

  new cron.CronJob({
    cronTime: schedule[state].stock.report,
    onTick: () => StockReport.fetch({}).then(send),
    start: true
  });

  new cron.CronJob({
    cronTime: schedule[state].stock.monitor,
    onTick: () => StockMonitor.fetch({}).then(send),
    start: true
  });

  new cron.CronJob({
    cronTime: '00 */15 * * * *',
    onTick: () => {
      Logger.log('ticking');
    },
    start: true
  });
}
