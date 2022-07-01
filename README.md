## Suono

Suono is a simple native audio lib for music application, it compatible with android native browser.

Easy to extend and welcome PR and issues. ![prs]

[![npm][npm-img]][npm-url]
[![node][node-img]][node-url]
[![size][size]][size-url]
[![npm-l][npm-l]][npm-l-url]
[![npm-d][npm-d]][npm-d-url]
[![licenses][licenses]][licenses-url]

## Installation

```bash
npm i suono
# or using yarn
yarn add suono
```

## Started

```ts
import { Suono } from 'suono'

const suono = new Suono({
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

```html
<script type="module">
  import { Suono } from '../dist/index.esm.js'
  const suono = new Suono({
    mode: 'order' // default value
  })
</script>
```

## Feature

- Support singleton with globally shared and multiple instaces
- Support Publish-Subscribe, listen to audio events and can set callback to provide fully controlled
- Have four play mode inside, order, list, single, random and also custom mode
- Support multiple audio file extenstion and allow to fallback

## Options

### src: string | string[]

return the current source of the audio

### debug: boolean

for debugging

### autoplay: boolean

set auto play or not, according to the browser autoplay strategy
### preload: string

set the native preload type, such as `none, metadata, auto`. Default value is `metadata`

### loop: boolean

set loop, default false

### controls: boolean

set true to show the native controls for audio tag

### volume: number

set the range of volume, range from 0 to 1

### crossorigin: string

if face the croessorigin issue, you can set the crossorigin type: `anonymous` or `use-credentials`


### Instance properties

### name: string

### duration: number

### fallback: string

### loading: boolean

if the source is loading, will return true

### playList: ListItem[]

the playlist from the instance
### currentIndex: number

the current index in the playlist

### mode: string

the playmode,`'order', 'single', 'shuffle', 'list'`

### autoSkip: boolean

set auto skip to next audio when encounter errors or something else

## API

### init({ src, name }: ListItem)

create the audio in the memory and register the hooks for events, and load the resources.

### load()

reset the media element and load the resources, play from the start

### play()

play the audio

### pause()

pause the audio

### seek(target: number)

seek to the specific timing of the audio

### skipTo(listItem: ListItem) / switch({ name, src }: ListItem)

skip to the other item in the playlist and play

### prev() && next()

play the previous or the next item in the playlist, will have different behavior accord to different play mode

### appendChild()

append the audio element before the end tag of body

### removeChild()

remove the audio element from the end tag of body

### destroy()

destroy the audio instance and element

### getName(): string

get current item name

### getSrc(): string

get current item src

### getCurrentSrc(): string

get current item sources, for multiple source item

### getCurrentTime(): number

### getPlayList(): ListItem[]

### updateLoop(status: boolean)

### updateName(name: string, src: string)

### updateLoading(status: boolean)

### updateDuration(duration: number)

### updatePlayMode(mode: string)

### updatePlayList(list: ListItem[])


## Develop

```json
"scripts": {
  "prebuild": "del-cli dist",
  "esm": "tsc --module esnext && cpy dist/index.js dist --rename index.esm.js",
  "cjs": "tsc --module commonjs",
  "build": "npm run esm && npm run cjs",
  "dev": "npm run build --watch",
}
```
## License

MIT

[prs]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[size]: https://badge-size.herokuapp.com/hawtim/suono/master/dist/index.js?compression=gzip&style=flat-square
[size-url]: https://github.com/hawtim/suono/master/dist/
[typescript]: https://img.shields.io/badge/-TypeScript-007ACC?style=flat-square&logo=typescript
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
