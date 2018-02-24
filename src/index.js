const cron = require('cron');
const TelegramBot = require('node-telegram-bot-api');
const sheets = require('./sheets');
const chat = require('../secrets/chat');

const schedule = {
  debug: '00 * * * * *',
  live: '* 48 8 * * *'
};

const bot = new TelegramBot(chat.token, { polling: true });
// eslint-disable-next-line camelcase
const send = data => bot.sendMessage(chat.chatId, data, { parse_mode: 'markdown' });

const state = process.argv[2] || '';

if (state) {
  new cron.CronJob({
    cronTime: schedule[state],
    onTick: function() {
      sheets.fetch().then(send);
    },
    start: true
  });
} else {
  sheets.fetch().then(send);
}
