const cron = require('cron');
const moment = require('moment');
const TelegramBot = require('node-telegram-bot-api');
const constants = require('../config/constants.js');
const JsonFileHelper = require('./lib/json-file-helper');
const Logger = require('./lib/log-helper');
const StockReporter = require('./worker/stock-report-worker');
const ForexReporter = require('./worker/forex-report-worker');
const ReminderReporter = require('./worker/reminder-report-worker');
const StockMonitor = require('./worker/stock-monitor-worker');
const ForexMonitor = require('./worker/forex-monitor-worker');
const ReminderMonitor = require('./worker/reminder-monitor-worker');
const BankReporter = require('./worker/bank-forex-report-worker');
const LearnReporter = require('./worker/learn-report-worker');
const Agent = require('./agent/agent');
const BankForexAgent = require('./agent/bank-forex-agent');
const ReminderMonitorAgent = require('./agent/reminder-monitor-agent');


global.debug = true;
const state = process.argv[2] || '';
let chatFile = 'chat.json';

const send = async(data) => {
  try {
    const chat = await JsonFileHelper.read(constants.secretPath(chatFile));
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
const day = today.clone().dayOfYear();
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
Logger.log(`Enable Bank? ${process.env.BANK || 'No'}`);
Logger.log(`Enable Bank? ${process.env.LEARN || 'No'}`);


const reminderReporter =  () => Agent.fetch(ReminderReporter, 'reminder', dates).then(send);
const reminderMonitor =   () => ReminderMonitorAgent.fetch(ReminderMonitor, 'reminder', dates[0], time).then(send);
const forexReporter =     () => Agent.fetch(ForexReporter, 'forex').then(send);
const forexMonitor =      () => Agent.fetch(ForexMonitor, 'forex').then(send);
const stockReporter =     () => Agent.fetch(StockReporter, 'stock').then(send);
const stockMonitor =      () => Agent.fetch(StockMonitor, 'stock').then(send);
const bankReporter =      () => BankForexAgent.update(BankReporter, 'bankforex');
const learnReporter =      () => Agent.fetch(LearnReporter, 'learn', day).then(send);


if (!state) {
  Logger.log('Fire once...');
  reminderReporter();
  reminderMonitor();
  forexReporter();
  forexMonitor();
  stockReporter();
  // stockMonitor();
  bankReporter();
  learnReporter();
} else {
  Logger.log('Create Cron...');

  if (process.env.REMINDER == 1) {
    reminderReporter();
    reminderMonitor();
    chatFile = 'reminderchat.json';
    Logger.log('reminder starts', chatFile);
    new cron.CronJob({
      cronTime: constants.schedule[state].reminder.report,
      onTick: reminderReporter,
      start: true
    });

    new cron.CronJob({
      cronTime: constants.schedule[state].reminder.monitor,
      onTick: reminderMonitor,
      start: true
    });
  }

  if (process.env.FOREX == 1) {
    forexReporter();
    forexMonitor();
    chatFile = 'forexchat.json';
    Logger.log('forex starts', chatFile);
    new cron.CronJob({
      cronTime: constants.schedule[state].forex.report,
      onTick: forexReporter,
      start: true
    });

    new cron.CronJob({
      cronTime: constants.schedule[state].forex.monitor,
      onTick: forexMonitor,
      start: true
    });
  }

  if (process.env.STOCK == 1) {
    stockReporter();
    // stockMonitor();
    chatFile = 'stockchat.json';
    Logger.log('stock starts', chatFile);
    new cron.CronJob({
      cronTime: constants.schedule[state].stock.report,
      onTick: stockReporter,
      start: true
    });

    new cron.CronJob({
      cronTime: constants.schedule[state].stock.monitor,
      onTick: stockMonitor,
      start: true
    });
  }

  if (process.env.BANK == 1) {
    bankReporter();
    Logger.log('bank starts');
    new cron.CronJob({
      cronTime: constants.schedule[state].bank.report,
      onTick: bankReporter,
      start: true
    });
  }

  if (process.env.LEARN == 1) {
    chatFile = 'learnchat.json';
    learnReporter();
    Logger.log('learn starts');
    new cron.CronJob({
      cronTime: constants.schedule[state].learn.report,
      onTick: learnReporter,
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
