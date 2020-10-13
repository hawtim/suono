interface Suono {
  sound: HTMLAudioElement
  name: string
  duration: number
  status: boolean
  loading: boolean
  controls: boolean
  playList: ListItem[]
  currentIndex: number
  mode: string
  playType: PlayType
  autoSkip: boolean
  volume: number
  suonoEvent: SuonoEvent
}

interface ListItem {
  [property: string]: any
  src: string
  name: string
}

interface PlayType {
  [playType: string]: () => void
  order: () => void
  singleLoop: () => void
  random: () => void
  listLoop: () => void
}

interface Options {
  [property: string]: any
  autoSkip?: boolean
  mode?: string
  volume?: number
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
  canplay, canplaythrough, // Firefox
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
const ReadyStateMap = {
  0: 'HAVE_NOTHING',
  1: 'HAVE_METADATA',
  2: 'HAVE_CURRENT_DATA',
  3: 'HAVE_FUTURE_DATA',
  4: 'HAVE_ENOUGH_DATA'
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
    this.duration = 0
    this.status = false
    this.name = ''
    this.loading = false
    // No controls by default
    this.controls = false
    this.sound = null
    this.volume = options.volume || 1
    // Control the play back and forth
    this.playList = playList || []
    this.currentIndex = 0
    // Invalid file or unsupported file will skip
    this.autoSkip = options.autoSkip || true
    // Order random singleLoop listLoop, order mode is default option
    this.mode = options.mode || 'order'
    this.playType = {
      order: this.order,
      singleLoop: this.singleLoop,
      random: this.random,
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
    this.name = name || 'unknown'
    this.playList.push({
      src, name
    })
    // Create the audio element
    this.sound = document.createElement('audio')
    // To avoid loading the whole file, preload the meta data.
    this.sound.preload = 'metadata'
    this.sound.controls = false
    // Add events listener
    this.handleEvent()
    if (!src) {
      throw new Error('not found')
    }
    this.sound.src = src
    // Load the resource
    this.load()
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
    this.updateStatus(false)
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
  canplay() {
    this.updateLoading(false)
    this.updateDuration(Math.round(this.sound.duration))
    this.updateStatus(true)
  }
  // Handle the play mode
  prev() {
    // No list no behavior
    if (this.playList.length === 0) {
      return
    }
    this.pause()
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
    this.pause()
    if (this.currentIndex === this.playList.length - 1) {
      this.currentIndex = 0
    } else {
      this.currentIndex += 1
    }
    this.switch(this.playList[this.currentIndex])
  }
  switch({ name, src }: ListItem) {
    this.sound.src = src
    this.name = name
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
    this.switch(this.playList[this.currentIndex])
  }
  random() {
    const index = randomNumberBoth(0, this.playList.length - 1)
    this.currentIndex = index
    this.switch(this.playList[index])
  }
  listLoop() {
    this.next()
  }
  // Get instance information
  getName(): string {
    return this.name
  }
  getSrc(): string {
    return this.sound.currentSrc || this.sound.src
  }
  getCurrentTime(): number {
    return this.sound.currentTime
  }
  getList(): ListItem[] {
    return this.playList
  }
  // Update file name
  updateName(name: string, src: string) {
    this.playList = this.playList.map(item => {
      if (item.src === src) {
        item.name = name
      }
      return item
    })
  }
  // Update the view layer
  updateLoading(status: boolean) {
    this.loading = status
  }
  updateDuration(duration: number) {
    this.duration = duration
  }
  updateStatus(status: boolean) {
    this.status = status
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
  // Handle events and errors
  handleEvent() {
    // Add events cyclically
    Object.keys(EventMap).forEach(key => {
      this.sound.addEventListener(key, () => {
        console.log(key)
        this.suonoEvent.trigger(key, this)
      })
    })
    // Custom callback for specific event
    this.suonoEvent.listen('canplay', () => {
      this.canplay()
    })
    this.suonoEvent.listen('durationchange', () => {
      this.updateDuration(Math.round(this.sound.duration))
    })
    this.suonoEvent.listen('pause', () => {
      this.pause()
    })
    this.suonoEvent.listen('play', () => {
      this.updateLoading(true)
      this.updateDuration(Math.round(this.sound.duration))
      this.updateStatus(true)
    })
    this.suonoEvent.listen('playing', () => {
      console.log(`${String(NetworkErrMap[this.sound.networkState])}`)
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
        this.playType[this.mode].call(this)
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
    throw new Error(`${String(LoadErrMap[code])}${suffix}`)
  }
}

// A singleton instance for specifies.
const SingleTonSuono = commonProxySingleton(Suono)

export { Suono, SingleTonSuono }
