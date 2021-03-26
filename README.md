# qiita-trend-bot

![notification](https://github.com/ysmtegsr/qiita-trend-bot/workflows/notification/badge.svg)

## Overview

This project is a bot that notifies qiita trend articles to any slack channel.

The mechanism is to scrape the website and get the DOM. From there, format the data to JSON and run the slack API.

## Architecture

- [Node.js](https://nodejs.org/ja/)
- [GitHub Actions](https://github.co.jp/features/actions)
- [Incoming Webhook](https://slack.com/apps/A0F7XDUAZ)

![architecture](https://user-images.githubusercontent.com/38056766/97313375-e24a6c80-18a9-11eb-87f9-9202121eb626.png)

## Demonstration

![demo](https://user-images.githubusercontent.com/38056766/97309932-fab88800-18a5-11eb-9bca-a0ccaa7117a5.png)

## License

Have a look at [this](https://github.com/ysmtegsr/qiita-trend-bot/blob/master/LICENSE).
