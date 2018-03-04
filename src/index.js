const cron = require('cron');
const moment = require('moment');
const TelegramBot = require('node-telegram-bot-api');
const stockReport = require('./job/stock-report-job');
const forexReport = require('./job/forex-report-job');
const reminderReport = require('./job/reminder-report-job');
const stockMonitor = require('./job/stock-monitor-job');
const forexMonitor = require('./job/forex-monitor-job');
const reminderMonitor = require('./job/reminder-monitor-job');
const logger = require('./lib/log-helper');

const chat = require('../secrets/chat');

const schedule = {
  live: {
    reminder: {
      report:  '15 48 8 * * *',
      monitor: '15 0 9-22/1 * * *'
    },
    forex: {
      report:  '30 48 10 * * 1-6',
      monitor: '30 48 11-20/4 * * 1-5'
    },
    stock: {
      report:  '45 10 9 * * 1-6',
      monitor: '45 10 10-5/1 * * 1-5'
    },
    log: {
      monitor: '00 */10 * * * *'
    }
  },
  debug: {
    reminder: {
      report:  '5 */6 * * * *',
      monitor: '15 */3 * * * *'
    },
    forex: {
      report:  '25 */4 * * * *',
      monitor: '35 */2 * * * *'
    },
    stock: {
      report:  '45 */15 * * * *',
      monitor: '55 */4 * * * *'
    },
    log: {
      monitor: '00 */1 * * * *'
    }
  }
};

const log = logger.bind(false);

const bot = new TelegramBot(chat.token, {polling: false});
const send = data => {
  log(data);
  /* eslint-disable */
  data ? bot.sendMessage(chat.chatId, data, {parse_mode: 'markdown'}) : '';
  /* eslint-enable */
};

const state = process.argv[2] || '';
log('running in state ', state);

const today = moment().startOf('day');
let dates = [];
for (let day = 0; day < 3; day++) {
  const d = today.clone().add(day, 'day').format('DD MMM YYYY');
  dates.push(d);
}
let time = moment().format('HH');

log(dates[0], time);

if (!state) {
  reminderReport.fetch(dates, {log}).then(send);
  reminderMonitor.fetch(dates[0], time, {log}).then(send);
  forexReport.fetch({log}).then(send);
  forexMonitor.fetch({log}).then(send);
  stockReport.fetch({log}).then(send);
  stockMonitor.fetch({log}).then(send);
} else {
  new cron.CronJob({
    cronTime: schedule[state].reminder.report,
    onTick: () => reminderReport.fetch(dates, {log}).then(send),
    start: true
  });

  new cron.CronJob({
    cronTime: schedule[state].reminder.monitor,
    onTick: () => reminderMonitor.fetch(dates[0], time, {log}).then(send),
    start: true
  });

  new cron.CronJob({
    cronTime: schedule[state].forex.report,
    onTick: () => forexReport.fetch({log}).then(send),
    start: true
  });

  new cron.CronJob({
    cronTime: schedule[state].forex.monitor,
    onTick: () => forexMonitor.fetch({log}).then(send),
    start: true
  });

  new cron.CronJob({
    cronTime: schedule[state].stock.report,
    onTick: () => stockReport.fetch({log}).then(send),
    start: true
  });

  new cron.CronJob({
    cronTime: schedule[state].stock.monitor,
    onTick: () => stockMonitor.fetch({log}).then(send),
    start: true
  });

  new cron.CronJob({
    cronTime: '00 */15 * * * *',
    onTick: () => {
      log('ticking');
    },
    start: true
  });
}
