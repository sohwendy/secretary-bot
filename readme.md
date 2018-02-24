# telegram-bot-secretary

[![Greenkeeper badge](https://badges.greenkeeper.io/sohwendy/telegram-bot-secretary.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/sohwendy/telegram-bot-secretary.svg?branch=master)](https://travis-ci.org/sohwendy/telegram-bot-secretary)  

A bot that reads google sheets data to send notifications to telegram chat.

It retrieves events from google sheets using google service account.  
It filters out the event and send the notifications.  
2 notifications are sent per event, the day before and on the actual day.

## Data
Spreadsheet  

| date (A1)    | time (A2)| type (A3)| title (A4)  |
| ------------ |:--------:|:--------:| -----------:|  
| 28 Feb 2018  | 15:00    | Write    | Tests       |  
| 28 Feb 2018  | 15:00    | Book     | Shuttle     |  
| 21 Mar 2018  | 08:00    | Upgrade  | Packages    |  

On 28 Feb 2018, this message will be sent to telegram:

Upcoming events:  
Write Shuttle  
Book Shuttle  

## Configuration
1. Rename sample/ to secrets/
2. Download Google Service key json for google sheet  
Rename the file to google.json  
Drop the file into the secrets/ 
3. Create a Telegram bot.  
Update the token and chatId in secrets/chat.js
4. Create a spreadsheet and share it to the google service email  
Update the spreadsheet id in secrets/sheets.js

## Running the bot
```
yarn install
yarn start
```

## To do 
[ ] check time for reminder
[ ] scheduler
[X] docker
[X] tests
[ ] use sinon for mock and spying

## References
[Node.js Quickstart | Sheets API | Google Developers ](https://developers.google.com/sheets/api/quickstart/nodejs)
