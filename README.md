## Suono

![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?style=flat-square&logo=typescript)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhawtim%2Fsuono.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhawtim%2Fsuono?ref=badge_shield)

## Feature

- 支持单例模式，全局实例共享
- 支持发布订阅模式，提供了所有的音视频事件的回调钩子，基于 MDN 的事件列表
- 内置了四种播放模式的实现，顺序播放、列表循环、单曲循环、随机播放
- 支持自定义播放模式

## Example

### 单例模式

用 new 的方式调用始终拿到同一个实例。
```html
<script type="module">
  import { SingleTonSuono } from '../dist/index.esm.js'
  var suono = new SingleTonSuono({
    mode: 'random'
  })
  var suono1 = new SingleTonSuono()
  console.log(suono1 === suono) // true
</script>
```

### 非单例模式

```html
<script type="module">
  import { Suono } from '../dist/index.esm.js'
  var suono = new Suono({
    mode: 'random' // order, singleLoop, random, listLoop
  })
</script>
```

## Develop

```json
"scripts": {
  "prebuild": "del-cli dist",
  "esm": "tsc --module esnext && cpy dist/index.js dist --rename index.esm.js",
  "cjs": "tsc --module commonjs",
  "build": "npm run esm && npm run cjs",
  "test": "xo && nyc ava",
  "dev": "npm run build --watch"
}
```

## Test

npm run test

## License

ISC

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhawtim%2Fsuono.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhawtim%2Fsuono?ref=badge_large)