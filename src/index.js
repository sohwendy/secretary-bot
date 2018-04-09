const cron = require('cron');
const moment = require('moment');
const TelegramBot = require('node-telegram-bot-api');
const constants = require('../config/constants.js');
const JsonFileHelper = require('./lib/json-file-helper');
const Logger = require('./lib/log-helper');
const StockReport = require('./job/stock-report-job');
const ForexReport = require('./job/forex-report-job');
const ReminderReport = require('./job/reminder-report-job');
const StockMonitor = require('./job/stock-monitor-job');
const ForexMonitor = require('./job/forex-monitor-job');
const ReminderMonitor = require('./job/reminder-monitor-job');

global.debug = true;
const state = process.argv[2] || '';
let chatFile = 'chat.json';

const send = async(data) => {
  try {
    const chat = await JsonFileHelper.get(constants.secretPath(false, chatFile));
    Logger.log(chatFile, chat);

    const bot = new TelegramBot(chat.token, { polling: false });
    /* eslint-disable */
    Logger.log(data);
    data ? bot.sendMessage(chat.chatId, data, { parse_mode: 'markdown' }) : '';
    /* eslint-enable */
  } catch (e) {
    Logger.log(e);
  }
};

const today = moment().local().startOf('day');
let dates = [];
for (let day = 0; day < 3; day++) {
  const d = today.clone().add(day, 'day').format('DD MMM YYYY');
  dates.push(d);
}
let time = moment().local().format('HH');

Logger.log(dates[0], time);
Logger.log('Run State?', state);
Logger.log(`Enable Reminder? ${process.env.REMINDER || 'No'}`);
Logger.log(`Enable Stock? ${process.env.STOCK || 'No'}`);
Logger.log(`Enable Forex? ${process.env.FOREX || 'No'}`);

const reminderReport = () => ReminderReport.fetch(dates, {}).then(send);
const reminderMonitor = () => ReminderMonitor.fetch(dates[0], time, {}).then(send);
const forexReport = () => ForexReport.fetch({}).then(send);
const forexMonitor = () => ForexMonitor.fetch({}).then(send);
const stockReport = () => StockReport.fetch({}).then(send);
const stockMonitor = () => StockMonitor.fetch({}).then(send);


if (!state) {
  Logger.log('Fire once...');
  // reminderReport();
  // reminderMonitor();
  // forexReport();
  // forexMonitor();
  stockReport();
  // stockMonitor();
} else {
  Logger.log('Create Cron...');

  if (process.env.REMINDER === 1) {
    reminderReport();
    reminderMonitor();
    chatFile = 'reminderchat.json';
    Logger.log('reminder starts', chatFile);
    new cron.CronJob({
      cronTime: constants.schedule[state].reminder.report,
      onTick: reminderReport,
      start: true
    });

    new cron.CronJob({
      cronTime: constants.schedule[state].reminder.monitor,
      onTick: reminderMonitor,
      start: true
    });
  }

  if (process.env.FOREX === 1) {
    forexReport();
    forexMonitor();
    chatFile = 'forexchat.json';
    Logger.log('forex starts', chatFile);
    new cron.CronJob({
      cronTime: constants.schedule[state].forex.report,
      onTick: forexReport,
      start: true
    });

    new cron.CronJob({
      cronTime: constants.schedule[state].forex.monitor,
      onTick: forexMonitor,
      start: true
    });
  }

  if (process.env.STOCK === 1) {
    stockReport();
    stockMonitor();
    chatFile = 'stockchat.json';
    Logger.log('stock starts', chatFile);
    new cron.CronJob({
      cronTime: constants.schedule[state].stock.report,
      onTick: stockReport,
      start: true
    });

    new cron.CronJob({
      cronTime: constants.schedule[state].stock.monitor,
      onTick: stockMonitor,
      start: true
    });
  }

  new cron.CronJob({
    cronTime: '00 */15 * * * *',
    onTick: () => {
      Logger.log('heartbeat');
    },
    start: true
  });
}


