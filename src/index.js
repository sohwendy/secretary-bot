const cron = require('cron');
const TelegramBot = require('node-telegram-bot-api');
const sheets = require('./sheets');
const forex = require('./forex');
const chat = require('../secrets/chat');

const schedule = {
  notification: {
    debug: {
      daily: '00 * * * * *',
      minute: '00 * * * * *'
    },
    live: {
      daily: '* 48 8 * * *',
      minute: '* */15 8 * * *'
    }
  },
  alert: {
    debug: {
      daily: '00 * 9-17/2 * * *',
      minute: '00 * * * * *'
    },
    live: {
      daily: '* 48 10 * * *',
      minute: '* */15 8 * * *'
    }
  }
};

const bot = new TelegramBot(chat.token, { polling: true });
const send = data => {
// eslint-disable-next-line camelcase
  data ? bot.sendMessage(chat.chatId, data, { parse_mode: 'markdown' }) : '';
};

const state = process.argv[2] || '';

if (!state) {
  sheets.fetchNotification().then(send);
  sheets.fetchAlert().then(send);
  forex.fetchNotification().then(send);
  forex.fetchAlert().then(send);
} else {
  // daily
  new cron.CronJob({
    cronTime: schedule.notification[state].daily,
    onTick: () => sheets.fetchNotification().then(send),
    start: true
  });

  // monitor 15 min
  new cron.CronJob({
    cronTime: schedule.notification[state].minute,
    onTick: () => sheets.fetchAlert().then(send),
    start: true
  });

  // daily
  new cron.CronJob({
    cronTime: schedule.alert[state].daily,
    onTick: () => forex.fetchNotification().then(send),
    start: true
  });

  // monitor 2h
  new cron.CronJob({
    cronTime: schedule[state].alert.minute,
    onTick: () => forex.fetchAlert().then(send),
    start: true
  });
}
