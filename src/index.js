const cron = require('cron');
const moment = require('moment');
const TelegramBot = require('node-telegram-bot-api');
const constants = require('../config/constants.js');
const JsonFileHelper = require('./lib/json-file-helper');
const Logger = require('./lib/log-helper');
const StockRpt = require('./worker/stock-report-worker');
const ForexRpt = require('./worker/forex-report-worker');
const ReminderRpt = require('./worker/reminder-report-worker');
const StockMon = require('./worker/stock-monitor-worker');
const ForexMon = require('./worker/forex-monitor-worker');
const ReminderMon = require('./worker/reminder-monitor-worker');
const BankRpt = require('./worker/bank-forex-report-worker');
const LearnRpt = require('./worker/learn-report-worker');
const Agent = require('./agent/agent');
const BankForexAgent = require('./agent/bank-forex-agent');
const ReminderMonAgent = require('./agent/reminder-monitor-agent');


global.debug = true;
const state = process.argv[2] || '';

const send = async(data, chatFile) => {
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

const getDates = () => {
  const today = moment().local().startOf('day');
  let dates = [];
  for (let i = 0; i < 3; i++) {
    const d = today.clone().add(i, 'day').format('DD MMM YYYY');
    dates.push(d);
  }
  return dates;
};

const getDay = () => {
  const today = moment().local().startOf('day');
  return today.clone().dayOfYear();
};

const getTime = () => {
  return moment().local().format('HH');
};

Logger.log('Run State?', state);
Logger.log(`Enable Reminder? ${process.env.REMINDER || 'No'}`);
Logger.log(`Enable Stock? ${process.env.STOCK || 'No'}`);
Logger.log(`Enable Forex? ${process.env.FOREX || 'No'}`);
Logger.log(`Enable Bank? ${process.env.BANK || 'No'}`);
Logger.log(`Enable Bank? ${process.env.LEARN || 'No'}`);


const reminderRpt = () => Agent
  .fetch(ReminderRpt, 'reminder', getDates()).then(data => send(data, 'reminderchat.json'));
const reminderMon = () => ReminderMonAgent
  .fetch(ReminderMon, 'reminder', getDates()[0], getTime()).then(data => send(data, 'reminderchat.json'));

const forexRpt = () => Agent
  .fetch(ForexRpt, 'forex').then(data => send(data, 'forexchat.json'));
const forexMon = () => Agent
  .fetch(ForexMon, 'forex').then(data => send(data, 'forexchat.json'));

const stockRpt = () => Agent
  .fetch(StockRpt, 'stock').then(data => send(data, 'stockchat.json'));
const stockMon = () => Agent
  .fetch(StockMon, 'stock').then(data => send(data, 'stockchat.json'));

const learnRpt = () => Agent
  .fetch(LearnRpt, 'learn', getDay()).then(data => send(data, 'learnchat.json'));

const bankRpt = () => BankForexAgent.update(BankRpt, 'bankforex');


if (!state) {
  Logger.log('Fire once...');
  reminderRpt();
  reminderMon();
  forexRpt();
  forexMon();
  stockRpt();
  // stockMon();
  bankRpt();
  learnRpt();
} else {
  Logger.log('Create Cron...');

  if (process.env.LEARN == 1) {
    learnRpt();
    Logger.log('learn starts');
    new cron.CronJob({
      cronTime: constants.schedule[state].learn.report,
      onTick: learnRpt,
      start: true
    });
  }

  if (process.env.REMINDER == 1) {
    reminderRpt();
    reminderMon();
    Logger.log('reminder starts');
    new cron.CronJob({
      cronTime: constants.schedule[state].reminder.report,
      onTick: reminderRpt,
      start: true
    });

    new cron.CronJob({
      cronTime: constants.schedule[state].reminder.monitor,
      onTick: reminderMon,
      start: true
    });
  }

  if (process.env.FOREX == 1) {
    forexRpt();
    forexMon();
    Logger.log('forex starts');
    new cron.CronJob({
      cronTime: constants.schedule[state].forex.report,
      onTick: forexRpt,
      start: true
    });

    new cron.CronJob({
      cronTime: constants.schedule[state].forex.monitor,
      onTick: forexMon,
      start: true
    });
  }

  if (process.env.STOCK == 1) {
    stockRpt();
    // stockMon();
    Logger.log('stock starts');
    new cron.CronJob({
      cronTime: constants.schedule[state].stock.report,
      onTick: stockRpt,
      start: true
    });

    new cron.CronJob({
      cronTime: constants.schedule[state].stock.monitor,
      onTick: stockMon,
      start: true
    });
  }

  if (process.env.BANK == 1) {
    bankRpt();
    Logger.log('bank starts');
    new cron.CronJob({
      cronTime: constants.schedule[state].bank.report,
      onTick: bankRpt,
      start: true
    });
  }

  // new cron.CronJob({
  //   cronTime: '00 */15 * * * *',
  //   onTick: () => {
  //     Logger.log('heartbeat');
  //   },
  //   start: true
  // });
}
