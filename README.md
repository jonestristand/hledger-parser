# Welcome to hledger-parser 👋

<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/jonestristand/hledger-parser#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/jonestristand/hledger-parser/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/jonestristand/hledger-parser/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/jonestristand/hledger-parser" />
  </a>
  <a href="https://dl.circleci.com/status-badge/redirect/gh/jonestristand/hledger-parser/tree/main" target="_blank">
    <img alt="Circle CI" src="https://dl.circleci.com/status-badge/img/gh/jonestristand/hledger-parser/tree/main.svg?style=shield">
  </a>
  <a href="https://twitter.com/TDJonesEM" target="_blank">
    <img alt="Twitter: TDJonesEM" src="https://img.shields.io/twitter/follow/TDJonesEM.svg?style=social" />
  </a>
</p>

![hledger-parser logo](https://github.com/jonestristand/hledger-parser/blob/main/resources/logo-256.png?raw=true)

> A parser for ledger/hledger journal files based on Chevrotain

## Grammar

[🏗️ Parsing diagram](https://raw.githack.com/jonestristand/hledger-parser/main/diagram.html)

## Install as Library

```sh
npm install hledger-parser
```

## Usage

```typescript
import parseLedger from 'hledger-parser';
import type { HLedgerJournal } from 'hledger-parser';

const { ast: HLedgerJournal } = parseLedger(fileContents);
```

## Author

👤 **Tristan Jones <jones.tristand@gmail.com>**

- Website: https://www.tdjones.ca
- Twitter: [@TDJonesEM](https://twitter.com/TDJonesEM)
- Github: [@jonestristand](https://github.com/jonestristand)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/jonestristand/hledger-parser/issues). You can also take a look at the [contributing guide](https://github.com/jonestristand/hledger-parser/blob/master/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2022 [Tristan Jones <jones.tristand@gmail.com>](https://github.com/jonestristand).<br />
This project is [MIT](https://github.com/jonestristand/hledger-parser/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
