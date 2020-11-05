interface Suono {
  sound: HTMLAudioElement
  name: string
  src: string | string[]
  duration: number
  autoplay: boolean
  preload: string
  loop: boolean
  fallback: string
  debug: boolean
  loading: boolean
  controls: boolean
  playList: ListItem[]
  currentIndex: number
  mode: string
  playType: PlayType
  autoSkip: boolean
  volume: number
  timestamp: number
  crossorigin: string
  suonoEvent: SuonoEvent
}

interface ListItem {
  [property: string]: any
  src: string | string[]
  name: string
}

interface PlayType {
  [playType: string]: () => void
  order: () => void
  singleLoop: () => void
  shuffle: () => void
  listLoop: () => void
}

interface Options {
  [property: string]: any
  autoSkip?: boolean
  mode?: string
  volume?: number
  preload?: string
  controls?: boolean
  autoplay?: boolean
}

interface SuonoEvent {
  clientList: Record<string, any>
}

// Proxy for singleton
function commonProxySingleton(FunClass: new (options: Options, playList?: ListItem[]) => Suono) {
  let instance: Suono
  return (...rest: [Options, ListItem[]]) => {
    if (!instance) {
      instance = new FunClass(...rest)
    }
    return instance
  }
}

function randomNumberBoth(min: number, max: number): number {
  const range = max - min
  const random = Math.random()
  const number = min + Math.round(random * range)
  return number
}

// All events about audio and video
// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
enum EventMap {
  abort,
  audioprocess,
  canplay, canplaythrough, // Firefox
  complete,
  durationchange,
  emptied,
  ended,
  encrypted,
  error,
  loadeddata,
  loadedmetadata,
  interruptbegin, interruptend, // Firefox os
  loadstart,
  mozaudioavailable,
  pause,
  play,
  playing,
  progress,
  ratechange,
  seeked,
  seeking,
  stalled,
  suspend,
  timeupdate,
  volumechange,
  waiting,
}

const LoadErrMap = {
  1: 'MEDIA_ERR_ABORTED',
  2: 'MEDIA_ERR_NETWORK',
  3: 'MEDIA_ERR_DECODE',
  4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
}
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/networkState
const NetworkErrMap = {
  0: 'NETWORK_EMPTY',
  1: 'NETWORK_IDLE',
  2: 'NETWORK_LOADING',
  3: 'NETWORK_NO_SOURCE'
}
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
// const ReadyStateMap = {
//   0: 'HAVE_NOTHING',
//   1: 'HAVE_METADATA',
//   2: 'HAVE_CURRENT_DATA',
//   3: 'HAVE_FUTURE_DATA',
//   4: 'HAVE_ENOUGH_DATA'
// }

// enum PreloadMap {
//   none,
//   metadata,
//   auto
// }
// https://github.com/rello/audioplayer/wiki/audio-files-and-mime-types
const SourceTypeMap = {
  "flac": ["audio/flac"],
	"m3u": ["audio/mpegurl", "text/plain"],
	"m3u8": ["audio/mpegurl", "text/plain"],
	"m4a": ["audio/mp4"],
	"m4b": ["audio/mp4"],
	"mp3": ["audio/mpeg"],
	"ogg": ["audio/ogg"],
	"opus": ["audio/ogg"],
	"pls": ["audio/x-scpls", "text/plain"],
  "wav": ["audio/wav"],
  "webm": ["audio/webm"],
	"wma": ["audio/x-ms-wma"],
	"xspf": ["application/xspf+xml", "text/plain"]
}
// Implement a publish and subscribe event bridge
class SuonoEvent {
  constructor() {
    this.clientList = {}
  }
  listen(key: string, callback: () => void) {
    if (!this.clientList[key]) {
      this.clientList[key] = []
    }
    this.clientList[key].push(callback)
  }
  trigger(key: string, ...rest: any) {
    const callbacks = this.clientList[key]
    if (!callbacks || callbacks.length === 0) {
      return false
    }
    // Just use for loop to avoid async function in loop
    for (const callback of callbacks) {
      callback.apply(this, rest)
    }
  }
  remove(key: string, callback: () => void) {
    const callbacks = this.clientList[key]
    if (!callbacks) {
      return false
    }
    if (!callback) {
      // Cancel all subscribe functions if without specific callback
      if (callbacks) {
        callbacks.length = 0
      }
      return
    }
    for (let length = callbacks.length - 1; length >= 0; length--) {
      const _callback = callbacks[length]
      if (_callback === callback) {
        // Delete callback
        callbacks.splice(length, 1)
      }
    }
  }
}

class Suono {
  // Constructor for different params
  constructor(options: Options = {}, playList?: ListItem[]) {
    const baseOptions = {
      autoplay: false,
      controls: false,
      preload: 'metadata',
      fallback: 'Your browser doesn\'t support HTML5 audio.',
      autoSkip: true,
      volume: 1,
      mode: 'order',
      debug: false,
      crossorigin: 'anonymous' // use-credentials
    }
    const opt = Object.assign({}, baseOptions, options)
    this.timestamp = +new Date
    this.duration = 0
    this.loop = false
    this.name = ''
    this.src = ''
    this.debug = opt.debug
    this.loading = false
    this.fallback = opt.fallback
    this.autoplay = opt.autoplay
    this.crossorigin = opt.crossorigin
    // To avoid loading the whole file, preload the meta data.
    this.preload = opt.preload
    // No controls by default
    this.controls = opt.controls
    this.sound = null
    this.volume = opt.volume
    // Control the play back and forth
    this.playList = playList || []
    this.currentIndex = 0
    // Invalid file or unsupported file will skip
    this.autoSkip = opt.autoSkip
    // Order random singleLoop listLoop, order mode is default option
    this.mode = opt.mode
    this.playType = {
      order: this.order,
      singleLoop: this.singleLoop,
      shuffle: this.shuffle,
      listLoop: this.listLoop
    }
    // Initialize the event bridge
    this.suonoEvent = new SuonoEvent()
  }
  // Initialization
  init({ src, name }: ListItem) {
    if (!src) {
      throw new Error('Invalid audio source')
    }
    this.playList.push({
      src, name
    })
    this.sound = document.createElement('audio')
    this.setId()
    this.updatePreload(this.preload)
    this.updateControls(this.controls)
    // Add events listener
    this.handleEvent()
    this.switch({
      src, name
    })
  }
  updateAudio(src: string | string[]) {
    if (Array.isArray(src)) {
      let fragment = document.createDocumentFragment()
      src.forEach(item => {
        const source = document.createElement('source')
        const temp = item.split('.')
        const ext = temp[temp.length - 1]
        source.src = item
        source.type = SourceTypeMap[ext] ? SourceTypeMap[ext][0] : ''
        fragment.appendChild(source)
      })
      this.sound.appendChild(fragment)
    } else {
      this.sound.src = src
    }
    if (this.fallback) {
      let fragment = document.createDocumentFragment()
      const paragraph = document.createElement('p')
      paragraph.innerText = this.fallback
      fragment.appendChild(paragraph)
      this.sound.appendChild(fragment)
    }
  }
  appendChild() {
    document.body.appendChild(this.sound)
  }
  removeChild() {
    document.body.removeChild(this.sound)
  }
  destroy() {
    this.suonoEvent.trigger('beforeDeStroy', this)
    this.pause()
    this.removeEvent()
    this.sound = null
  }

  // Load the file
  load() {
    this.sound.load()
  }
  play() {
    // Play method got a promise as return value, using void to handle it
    void this.sound.play()
  }
  pause() {
    this.sound.pause()
  }
  seek(target: number) {
    if (target >= this.duration) {
      this.sound.currentTime = this.duration
    } else {
      this.sound.currentTime = target
    }
  }
  skipTo(listItem: ListItem) {
    const index = this.playList.findIndex(item => item === listItem)
    this.pause()
    this.switch(this.playList[index])
  }
  // Handle the play mode
  prev() {
    // No list no behavior
    if (this.playList.length === 0) {
      return
    }
    if (this.mode === 'shuffle') {
      return this.shuffle()
    }
    if (this.currentIndex === 0) {
      this.currentIndex = this.playList.length - 1
    } else {
      this.currentIndex -= 1
    }
    this.switch(this.playList[this.currentIndex])
  }
  next() {
    if (this.playList.length === 0) {
      return
    }
    if (this.mode === 'shuffle') {
      return this.shuffle()
    }
    this.currentIndex = this.getRandomIndex()
    // this.pause()
    if (this.currentIndex === this.playList.length - 1) {
      this.currentIndex = 0
    } else {
      this.currentIndex += 1
    }
    this.switch(this.playList[this.currentIndex])
  }
  switch({ name, src }: ListItem) {
    this.updateAudio(src)
    this.name = name || 'unknown'
    this.load()
    void this.play()
  }
  order() {
    if (this.currentIndex === this.playList.length - 1) {
      return
    }
    this.next()
  }
  singleLoop() {
    // Using property loop for single loop
    this.updateLoop(true)
    // this.switch(this.playList[this.currentIndex])
  }
  shuffle() {
    this.currentIndex = this.getRandomIndex()
    this.switch(this.playList[this.currentIndex])
  }
  listLoop() {
    this.next()
  }
  // A identity for audio instance
  setId(id?: string) {
    this.sound.id = id ? id : String(this.timestamp)
  }
  getId() {
    return this.timestamp
  }
  getRandomIndex(): number {
    if (this.playList.length === 1) {
      return 0
    }
    if (this.playList.length === 2) {
      // 0 or 1
      return Math.abs(this.currentIndex - 1)
    }
    // Handle if got the same index with the currentIndex
    const index = randomNumberBoth(0, this.playList.length - 1)
    const maxIndex = this.playList.length - 1
    if (index === this.currentIndex) {
      if (index === maxIndex) {
        return 0
      } else {
        return index + 1
      }
    }
    return index
  }
  // Get instance information
  getName(): string {
    return this.name
  }
  getSrc(): string {
    return this.sound.src
  }
  getCurrentSrc(): string {
    return this.sound.currentSrc
  }
  getCurrentTime(): number {
    return this.sound.currentTime
  }
  getList(): ListItem[] {
    return this.playList
  }
  updateLoop(status: boolean) {
    this.loop = status
    this.sound.loop = status
  }
  updateName(name: string, src: string) {
    this.playList = this.playList.map(item => {
      if (item.src === src) {
        item.name = name
      }
      return item
    })
  }
  updatePreload(type: string) {
    this.preload = type
    this.sound.preload = type
  }
  updateControls(status: boolean) {
    this.controls = status
    this.sound.controls = status
  }
  // Update the view layer
  updateLoading(status: boolean) {
    this.loading = status
  }
  updateDuration(duration: number) {
    this.duration = duration
  }
  updateMode(mode: string) {
    this.mode = mode
  }
  updateList(list: ListItem[]) {
    // Check the current item inside the list
    const index = list.findIndex(item => item.src === this.getSrc())
    if (index >= 0) {
      this.currentIndex = index
    } else {
      this.playList = this.playList.concat(list)
    }
  }
  debugConsole(string: string) {
    if (this.debug) {
      console.log(string)
    }
  }
  bindEvent() {
    Object.keys(EventMap).forEach(key => {
      this.sound.addEventListener(key, () => {
        this.debugConsole(key)
        this.suonoEvent.trigger(key, this)
      })
    })
  }
  removeEvent() {
    Object.keys(EventMap).forEach(key => {
      this.sound.removeEventListener(key, () => {
        this.suonoEvent.remove(key, () => {
          this.debugConsole(key)
          this.suonoEvent.trigger(key, this)
        })
      })
    })
  }
  // Handle events and errors
  handleEvent() {
    // Add events cyclically
    this.bindEvent()
    // Custom callback for specific event
    this.suonoEvent.listen('durationchange', () => {
      this.updateDuration(Math.round(this.sound.duration))
    })
    this.suonoEvent.listen('play', () => {
      this.updateLoading(true)
    })
    this.suonoEvent.listen('playing', () => {
      this.debugConsole(`${String(NetworkErrMap[this.sound.networkState])}`)
      if (this.sound.networkState === 2) {
        this.updateLoading(true)
        return
      }
      this.updateLoading(false)
    })
    this.suonoEvent.listen('ended', () => {
      // Use strategy mode for differ mode
      this.playType[this.mode].call(this)
    })
    this.suonoEvent.listen('error', () => {
      this.handleLoadError(this.sound.error)
      if (this.autoSkip) {
        // Just jump off
        this.next()
        // this.playType[this.mode].call(this)
      }
    })
    this.suonoEvent.listen('suspend', () => {
      this.updateLoading(false)
    })
    this.suonoEvent.listen('waiting', () => {
      this.updateLoading(true)
    })
  }
  handleLoadError({ code }: MediaError) {
    const suffix = ', Please refer to https://developer.mozilla.org/en-US/docs/Web/API/MediaError'
    try {
      throw new Error(`${String(LoadErrMap[code])}${suffix}`)
    } catch (error) {
      this.debugConsole(error.message)
    }
  }
}

// A singleton instance for specifies.
const SingleTonSuono = commonProxySingleton(Suono)

export { Suono, SingleTonSuono }
