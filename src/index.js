// const schedule = require('node-schedule');
const TelegramBot = require('node-telegram-bot-api');
const sheets = require('./sheets');
const chat = require('../secrets/chat');

// const rule = new schedule.RecurrenceRule();
// rule.day = [1, 2, 3, 4, 5];
// rule.hour = 8;
// rule.minute = 55;

// const weekday = schedule.scheduleJob(rule, fetch());

const bot = new TelegramBot(chat.token, { polling: false });
sheets
  .fetch()
  // eslint-disable-next-line camelcase
  .then(data => bot.sendMessage(chat.chatId, data, { parse_mode: 'markdown' }));
