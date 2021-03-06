# secretary-bot

[![Greenkeeper badge](https://badges.greenkeeper.io/sohwendy/secretary-bot.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/sohwendy/secretary-bot.svg?branch=master)](https://travis-ci.org/sohwendy/secretary-bot)
[![Known Vulnerabilities](https://snyk.io/test/github/sohwendy/secretary-bot/badge.svg?targetFile=package.json)](https://snyk.io/test/github/sohwendy/secretary-bot?targetFile=package.json)

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
npm run install
npm run live
```

## Running the bot once
```
npm run start
```

## Using docker-compose
```
docker-compose build
docker-compose up
docker-compose down
```

## To do 
[ ] update readme  
[ ] Use secret management - docker secrets, vault etc.  
[ ] create boilerplate  
[ ] Use user in dockerfile
[X] use sinon for mock and spying    
[X] docker  
[X] tests  
[X] check time for reminder  
[X] scheduler  

## Issue
Hardcoded the group of docker nodejs user
```1001 is the primary group of user who owns .secrets/
RUN groupadd -r nodejs -g 1001 \
  && useradd -m -r -g nodejs nodejs \
  && chown -R nodejs:nodejs /usr/app
```

## Helpful commands

Test a specific test file  
```npm run test-debug <file>```

Full test ( lint + unit tests + coverage )  
```npm run test```

Run locally  
```npm run start```


## References
[Node.js Quickstart | Sheets API | Google Developers ](https://developers.google.com/sheets/api/quickstart/nodejs)  
[ava test runner](https://github.com/avajs/ava)  

[![forthebadge](https://forthebadge.com/images/badges/contains-technical-debt.svg)](https://forthebadge.com)
