# 3Dera-JS

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> 3DeraJS is the JavaScript library to access 3Dera core functionality

## Install

```bash
npm install @kedos-srl/3dera-js
```

## Usage

```ts
import HederaJS from '3dera-js';

const canvas = document.getElementById('3dera-canvas') as HTMLCanvasElement;
await HederaJS.init(canvas);
await HederaJS.start();


```

[npm-img]: https://img.shields.io/npm/v/@kedos-srl/3dera-js
[build-img]: https://github.com/Kedos-srl/3dera-js/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/Kedos-srl/3dera-js/actions/workflows/release.yml
[npm-url]: https://www.npmjs.com/package/@kedos-srl/3dera-js
[issues-img]: https://img.shields.io/github/issues/Kedos-srl/3dera-js
[issues-url]: https://github.com/Kedos-srl/3dera-js/issues
[codecov-img]: https://codecov.io/gh/Kedos-srl/3dera-js/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/Kedos-srl/3dera-js
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
[downloads-img]: https://img.shields.io/npm/dt/@kedos-srl/3dera-js
[downloads-url]: https://www.npmtrends.com/@kedos-srl/3dera-js
