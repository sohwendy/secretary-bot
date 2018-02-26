const cron = require('cron');
const TelegramBot = require('node-telegram-bot-api');
const sheets = require('./sheets');
const forex = require('./forex');
const chat = require('../secrets/chat');

const schedule = {
  debug: {
    daily: '00 * * * * *',
    minute: '00 * * * * *'
  },
  live: {
    daily: '* 48 8 * * *',
    minute: '* */15 8 * * *'
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
} else {
  // daily
  new cron.CronJob({
    cronTime: schedule[state].daily,
    onTick: () => sheets.fetchNotification().then(send),
    start: true
  });

  // monitor 15 min
  new cron.CronJob({
    cronTime: schedule[state].minute,
    onTick: () => sheets.fetchAlert().then(send),
    start: true
  });
}
