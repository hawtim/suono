interface Suono {
  sound: HTMLAudioElement
  name: string
  src: string
  currentTime: number
  duration: number
  status: boolean
  loading: boolean
  controls: boolean
  list: Array<ListItem>
  currentIndex: number
}

interface ListItem {
  src: string
  name: string
}

// 支持单例模式
function commonProxySingleton(funClass: any) {
  let instance: Suono
  return function() {
    if (!instance) {
      instance = new funClass(arguments)
    }
    return instance
  }
}

class Suono {
  // 构造函数，可传入 list 或者后续再传
  constructor(src: string, name?: string, list?: ListItem[]) {
    this.duration = 0
    this.status = false
    this.src = src
    this.name = name
    this.loading = false
    // 默认没有控制选项
    this.controls = false
    this.sound = null
    this.currentTime = 0
    // 控制前后播放的相关参数
    this.list = list
    this.currentIndex = 0

  }
  // 初始化 audio 标签
  init({ src, name } : ListItem) {
    this.name = name
    this.src = src
    this.sound = document.createElement('audio')
    // 避免加载整个音频文件，只先加载元信息
    this.sound.preload = 'metadata'
    this.sound.controls = false
    // 添加各种监听事件
    this.attachEvent()
    if (!src) {
      throw new Error('未找到播放地址')
    }
    this.sound.src = src
    // 加载资源
    this.load()
  }
  // 添加监听事件
  attachEvent() {
    this.sound.addEventListener('pause', () => {
      this.pause()
    })
    this.sound.addEventListener('play', () => {
      this.updateLoading(true)
      this.updateDuration(Math.round(this.sound.duration))
      this.updateStatus(true)
      // 更新进度条
      // requestAnimationFrame(this.commit.bind(this, 'doctorLesson/STEP'))
    })
    this.sound.addEventListener('playing', () => {
      this.updateLoading(false)
    })
    this.sound.addEventListener('canplay', () => {
      this.canplay()
    })
    this.sound.addEventListener('load', () => {
      this.updateLoading(true)
    })
    this.sound.addEventListener('error', () => {
      console.log('音频播放出错', this.sound.error)
    })
    this.sound.addEventListener('suspend', () => {
      console.log('suspend')
      // 持续播放中会进入挂起状态
      this.updateLoading(false)
    })
    this.sound.addEventListener('abort', () => {
      console.log('音频播放中断', this.sound.error)
    })
    this.sound.addEventListener('resume', () => {
      console.log('音频播放恢复', this.sound.error)
    })
    this.sound.addEventListener('waiting', () => {
      this.updateLoading(true)
      console.log('音频等待中', this.sound.error)
    })
    this.sound.addEventListener('close', () => {
      console.log('close', this.sound.error)
    })
  }
  // 加载资源
  load() {
    this.sound.load()
  }
  play() {
    this.sound.play()
  }
  pause() {
    this.sound.pause()
    this.updateStatus(false)
  }
  canplay() {
    this.updateLoading(false)
    this.updateDuration(Math.round(this.sound.duration))
    this.updateStatus(true)
  }
  // 如果有列表，跳至上一首或者下一首
  prev() {

  }
  next() {

  }
  getName() {
    return this.name
  }
  getSrc() {
    return this.src
  }
  // 更新视图状态
  updateLoading(status: boolean) {
    this.loading = status
  }
  updateDuration(duration: number) {
    this.duration = duration
  }
  updateStatus(status: boolean) {
    this.status = status
  }
  updateCurrentTime(number: number) {
    this.currentTime = number
  }
  updateList(list: ListItem[]) {
    // 检查当前 src 是否在列表中
    const index = list.findIndex(item => item.src === this.src)
    if (index >= 0) {
      this.currentIndex = index
    } else {
      this.list = [{
        src: this.src,
        name: this.name
      }].concat(list)
    }
  }
}

let SingleTonSuono = commonProxySingleton(Suono)

export { Suono, SingleTonSuono }
