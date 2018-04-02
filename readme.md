# telegram-bot-secretary

[![Greenkeeper badge](https://badges.greenkeeper.io/sohwendy/telegram-bot-secretary.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/sohwendy/telegram-bot-secretary.svg?branch=master)](https://travis-ci.org/sohwendy/telegram-bot-secretary)  
[![Known Vulnerabilities](https://snyk.io/test/github/sohwendy/telegram-bot-secretary/badge.svg?targetFile=package.json)](https://snyk.io/test/github/sohwendy/telegram-bot-secretary?targetFile=package.json)

A bot that sends notifications (reminder, stock, forex) to telegram chat.
  
Notifications are classified into report and notification.
- Report refers to notification that is sent periodically eg once per day.  
- Monitor refers to notification that is sent only if the rule is met, adhoc basis. 


## Data (TBD)
Spreadsheet  

| date (A1)    | time (A2)| type (A3)| title (A4)  |
| ------------ |:--------:|:--------:| -----------:|  
| 28 Feb 2018  | 10:14:00 | Eat      | Breakfast   |  
| 28 Feb 2018  |          | Book     | Shuttle     |  
| 21 Mar 2018  | 19:20:00 | Upgrade  | Packages    |  

On 28 Feb 2018, this message will be sent to telegram:

Upcoming events:  
Write Shuttle  
Book Shuttle  

## Prerequisite
1. API token from [open exchange rates](https://openexchangerates.org)    
2. Google Service Account key and access to the google sheet  
3. Telegram bot token from [BotFather](https://telegram.me/BotFather)  
4. Structured data in Google sheets 

## Configuration
1. Copy sample/ to secrets/
2. Copy google service account key (google.json) into secrets
3. Update the open exchange rate key in oer.js
4. Update the telegram bot token and chat into chat.js

## Running the bot
```
yarn install
yarn live
```

# Using docker-compose
```
docker-compose build
docker-compose up
docker-compose down

```

## To do 
[ ] update readme  
[ ] Use secret management - docker secrets, vault etc.
[ ] create boilerplate  
[ ] use sinon for mock and spying 
[ ] Use user in dockerfile
[X] docker  
[X] tests  
[X] check time for reminder  
[X] scheduler  


## References
[Node.js Quickstart | Sheets API | Google Developers ](https://developers.google.com/sheets/api/quickstart/nodejs)  
[ava test runner](https://github.com/avajs/ava)  
