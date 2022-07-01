## Suono

Suono 是一个业务型音频库，比如音乐 app，付费音频 app 等业务场景，兼容至安卓浏览器原生浏览器。实际上线产品参考 Screenshot 一节。

保留了一定的拓展性，有任何场景需要欢迎 PR & Issues。

[![npm][npm-img]][npm-url]
[![node][node-img]][node-url]
[![size][size]][size-url]
[![npm-l][npm-l]][npm-l-url]
<!-- [![npm-d][npm-d]][npm-d-url] -->
<!-- [![licenses][licenses]][licenses-url] -->

![typescript][typescript]
[![xo][xo]][xo-url]
![prs]

## Installation

```bash

npm i suono

# or using yarn

yarn add suono

```

实例化

```js
import { Suono, SingleTonSuono } from 'suono'

var suono = new Suono({
  autoplay: false,
  controls: false,
  preload: 'metadata',
  fallback: 'Your browser doesn\'t support HTML5 audio.',
  autoSkip: true,
  volume: 1,
  mode: 'order',
  debug: false,
  crossorigin: 'anonymous'
})
```

## Feature

- 支持单例模式，全局实例共享
- 支持发布订阅模式，监听所有音频事件并回调实例
- 内置了四种播放模式，顺序播放、列表循环、单曲循环、随机播放
- 支持自定义播放模式
- 支持多种类型的音频文件并根据文件后缀匹配类型，同时支持降级提示

## Example

### 单例模式

```html
<script type="module">
  import { SingleTonSuono } from '../dist/index.esm.js'
  var suono = new SingleTonSuono()
  var suono1 = new SingleTonSuono()
  console.log(suono1 === suono) // true
</script>
```

### 非单例模式

```html
<script type="module">
  import { Suono } from '../dist/index.esm.js'
  var suono = new Suono()
</script>
```

### 四种播放模式

支持自定义播放模式，例如心动模式。

```html
<script type="module">
  import { Suono } from '../dist/index.esm.js'
  var suono = new Suono({
    mode: 'order' // 默认
  })
</script>
```

### 支持多种文件类型和降级提示

```js

// result
<audio controls>
  <source src="myAudio.mp3" type="audio/mpeg">
  <source src="myAudio.ogg" type="audio/ogg">
  <p>Your browser doesn\'t support HTML5 audio. Here is a <a href="myAudio.mp3">link to the audio</a> instead.</p>
</audio>
```

## Options

### Audio 使用

#### src: string | string[]

当前音频 src

#### debug: boolean

调试模式

#### autoplay: boolean

是否自动播放，需要遵循浏览器的自动播放策略

#### preload: string

预加载类型，`none, metadata, auto`，默认为 `metadata`

#### loop: boolean

是否循环播放

#### controls: boolean

是否展示音频控件

#### volume: number

音量大小，范围 [0, 1]

#### crossorigin: string

跨域加载类型， `anonymous` 或者 `use-credentials`

### 播放逻辑使用

#### name: string

音频名称

#### duration: number

音频播放时长

#### fallback: string

降级提示

#### loading: boolean

是否处在加载资源状态

#### playList: ListItem[]

播放列表

#### currentIndex: number

当前播放列表项目索引

#### mode: string

四种内置的播放类型，`'order', 'singleLoop', 'shuffle', 'listLoop'`

#### playType: PlayType

四种内置的播放策略，支持自定义播放类型

#### autoSkip: boolean

遇到播放错误等情况时是否自动进入下一首

#### timestamp: number

根据生成的时间戳用于生成唯一的 audio id

#### suonoEvent: SuonoEvent

发布订阅监管所有的 audio 事件触发

## API

### 通用

#### init({ src, name }: ListItem)

初始化播放，在内存中创建 audio 标签，注册订阅发布事件提供钩子，调用加载资源的方法

#### updateAudio(src: string | string[])

用于更新节点，同时添加降级提示

- src 是单个字符串：直接更新 audio 标签的 src
- src 是字符串数组：在 audio 标签内部挂载 source 标签并自动根据文件后缀设置 type

通过 this.fallback 的值设置降级提示

#### load()

加载资源，将媒体元素重置为其初始状态，并开始选择媒体源并加载媒体，以准备从头开始播放

#### play()

音频播放

#### pause()

音频暂停

#### seek(target: number)

快进到某个位置

#### skipTo(listItem: ListItem)

跳转到某一个列表项并播放

#### prev() && next()

上/下一个播放项目，根据不同的播放模式有不同的行为

#### switch({ name, src }: ListItem)

切换到对应的项目并播放

### DOM 挂载

#### appendChild()

将当前音频 DOM 挂载到页面上

#### removeChild()

将音频 DOM 从页面中移除

#### destroy()

销毁音频实例，需要重新调用 init

### 播放模式

#### order()

顺序播放模式，到列表最后一项会停止播放

#### singleLoop()

单曲循环，使用 audio.loop 属性

#### shuffle()

随机播放，上/下一首会根据此计算下一首的索引

#### listLoop()

列表循环，区别在于到列表最后一项的行为，列表循环为重新回到第一首

### 获取实例信息

#### getName(): string

获取当前播放项的名称

#### getSrc(): string

获取当前播放项的 src

#### getCurrentSrc(): string

获取当前播放项的实际播放 src ，对于有多个资源的项目

#### getCurrentTime(): number

获取当前播放项的进度时间

#### getList(): ListItem[]

获取当前的播放列表

### 更新数据

#### updateLoop(status: boolean)

更新 audio 标签的 loop 属性

#### updateName(name: string, src: string)

更新 Suono 实例的名称

#### updateLoading(status: boolean)

更新 Suono 实例的加载状态

#### updateDuration(duration: number)

更新 Suono 实例的播放时长

#### updateMode(mode: string)

更换播放模式

#### updateList(list: ListItem[])

更新播放列表

### 错误 & 调试

#### debugConsole(string: string)

调试模式下输出调试信息

#### handleEvent()

处理音频播放中所有触发的事件，通过 suonoEvent 发布事件并回调当前实例

#### handleLoadError({ code }: MediaError)

进行错误处理

## Develop

```json
"scripts": {
  "prebuild": "del-cli dist",
  "esm": "tsc --module esnext && cpy dist/index.js dist --rename index.esm.js",
  "cjs": "tsc --module commonjs",
  "build": "npm run esm && npm run cjs",
  "test": "ava",
  "dev": "npm run build --watch",
  "lint": "xo --fix"
}
```

## Test[TODO]

使用 `ava.js` 作为测试工具库，测试用例待完善。
- 自动化测试用例为 `test/test.js`
- 手动测试用例为 `test/index.html`

## License

MIT

[prs]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[size]: https://badge-size.herokuapp.com/hawtim/suono/master/dist/index.js?compression=gzip&style=flat-square
[size-url]: https://github.com/hawtim/suono/master/dist/
[typescript]: https://img.shields.io/badge/-TypeScript-007ACC?style=flat-square&logo=typescript
[xo-url]: https://github.com/xojs/xo
[xo]: https://img.shields.io/badge/code_style-XO-5ed9c7.svg
[licenses-url]: https://app.fossa.com/projects/git%2Bgithub.com%2Fhawtim%2Fsuono?ref=badge_shield
[licenses]: https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhawtim%2Fsuono.svg?type=shield
[npm-img]: https://img.shields.io/npm/v/suono.svg
[npm-url]: https://npmjs.com/package/suono
[node-img]: https://img.shields.io/node/v/vite.svg
[node-url]: https://nodejs.org/en/about/releases/
[npm-l]: https://img.shields.io/npm/l/suono.svg?style=flat-square
[npm-l-url]: https://github.com/hawtim/suono/blob/master/LICENSE
[npm-d]: https://img.shields.io/npm/dt/suono.svg?style=flat-square
[npm-d-url]: https://www.npmjs.com/package/suono