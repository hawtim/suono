export const doctorLesson = Object.freeze({
  INIT: 'INIT',
  UNLOAD: 'UNLOAD',
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  SKIP: 'SKIP',
  SEEK: 'SEEK',
  STEP: 'STEP',
  SKIPTO: 'SKIPTO',
  UPDATE_INDEX: 'UPDATE_INDEX',
  UPDATE_STATUS: 'UPDATE_STATUS',
  SET_AUDIOLIST: 'SET_AUDIOLIST',
  UPDATE_DURATION: 'UPDATE_DURATION',
  UPDATE_CURRENTTIME: 'UPDATE_CURRENTTIME',
  UPDATE_FILEID: 'UPDATE_FILEID',
  UPDATE_CLASSID: 'UPDATE_CLASSID',
  GET_PLAY_STATUS: 'GET_PLAY_STATUS',
  UPDATE_LOADING: 'UPDATE_LOADING',
  UPDATE_BUY: 'UPDATE_BUY',
  UPDATE_SOUNDID: 'UPDATE_SOUNDID',
  UPDATE_SUBMIT_ID: 'UPDATE_SUBMIT_ID',
  UPDATE_MEMORY_PLAY: 'UPDATE_MEMORY_PLAY',
  UPDATE_MEMORY_DATA: 'UPDATE_MEMORY_DATA',
  RECORD_LASTEST_LESSON: 'RECORD_LASTEST_LESSON',
  UPDATE_UTOKEN: 'UPDATE_UTOKEN'
})

function transformDurationStr(str) {
  const arr = str.split(':')
  const minuteSecond = parseInt(arr[0], 10) * 60
  const Second = parseInt(arr[1], 10)
  return minuteSecond + Second
}

function getFallBackDuration(browserDuration, duration) {
  if (parseFloat(browserDuration, 10) < 1) {
    return duration
  }
  return browserDuration
}

// 将 sound 对象挂载在 window 上
window.sound = null

const state = {
  currentTime: 0,
  duration: 0,
  audioIndex: 0,
  playStatus: false,
  audioList: [],
  classId: 0,
  fileId: 0,
  appId: 0,
  loading: false,
  isBuy: false,
  // 需要记录 soundID 每次传入进行播放，因为可能会生成多个 sound
  soundId: 0,
  submitId: 0,
  utoken: ''
}

const actions = {
  getAudioDetail: ({ commit }, options) => {
    return service.doctorLesson.getAudioDetail(options).then(data => {
      return data.data
    })
  },
  uploadAudioPlayData: ({ commit }, options) => {
    return service.doctorLesson.uploadAudioPlayStatus(options).then(data => {
      return data
    })
  },
  getAudioByFileId: ({ commit }, options) => {
    return service.doctorLesson.getAudioByFileId(options).then(data => {
      return data.videoInfo
    })
  }
}
const getters = {
  audioList: (state) => state.audioList,
  duration: (state) => state.duration,
  currentTime: (state) => state.currentTime,
  playStatus: (state) => state.playStatus,
  audioIndex: (state) => state.audioIndex,
  fileId: (state) => state.fileId,
  classId: (state) => state.classId,
  loading: (state) => state.loading,
  memoryData: (state) => state.memoryData,
  utoken: (state) => state.utoken
}

const mutations = {
  // 音频记忆播放
  [doctorLesson.UPDATE_MEMORY_DATA](state, data) {
    state.memoryData = data
  },
  [doctorLesson.UPDATE_MEMORY_PLAY](state, boolean) {
    state.memoryPlay = boolean
  },
  // 音频播放
  [doctorLesson.PLAY](state, index) {
    console.log(index)
    const curIndex = typeof index === 'number' ? index : state.audioIndex
    const data = state.audioList[curIndex]
    if (!data || (!state.isBuy && !data.is_free)) {
      return Toast('本节课程未购买')
    }
    // 暂停/播放触发
    if (sound && sound.tagName == 'AUDIO' && data.file.includes(sound.src)) {
      sound.play()
      // 切换音频的时候触发
    } else if (sound && sound.tagName == 'AUDIO' && !data.file.includes(sound.src)) {
      sound.src = data.file[0]
      sound.play()
      // 第一次播放的时候触发，初始化一个 audio 标签
    } else {
      this.commit('doctorLesson/INIT', data)
    }
    const checkOrigin = sound && sound.tagName == 'AUDIO'
    if (checkOrigin) {
      sound.currentTime = state.currentTime
      if (sound.paused) {
        sound.play()
      }
      this.commit('doctorLesson/UPDATE_STATUS', true)
    }
    this.commit('doctorLesson/UPDATE_INDEX', curIndex)
  },
  [doctorLesson.UNLOAD](state) {
    console.log('移除 audio 实例')
    sound = null
  },
  [doctorLesson.UPDATE_SUBMIT_ID](state, id) {
    state.submitId = id
  },
  [doctorLesson.INIT](state, data) {
    this.commit('doctorLesson/UNLOAD')
    console.log('使用 audio 标签')
    sound = document.createElement('audio')
    // 避免加载整个音频文件，只先加载元信息
    sound.preload = 'metadata'
    sound.controls = false
    sound.src = data.file[0]
    if (!sound.src) {
      Toast('未找到播放地址，请刷新重试')
    }
    // 原生 audio 的事件触发顺序是
    // 网络情况比较差的情况下
    // play -> waiting -> canplay -> playing -> waiting -> canplay -> playing -> pause -> play -> playing -> waiting

    // 网络情况比较好的情况下
    // play -> playing -> suspend -> pause -> play -> playing -> waiting -> canplay -> suspend
    // 播放完毕事件监听
    sound.addEventListener('ended', () => {
      const params = {
        play_type: 1, // 1 播完次数 2. 播放时长
        file_id: state.fileId,
        play_duration: state.duration, // 播放时长
        class_id: state.classId
      }
      this.dispatch('doctorLesson/uploadAudioPlayData', params)
      this.commit('doctorLesson/SKIP', 'next')
    }, false)
    sound.addEventListener('pause', () => {
      this.commit('doctorLesson/UPDATE_STATUS', false)
    })
    // 播放事件监听
    sound.addEventListener('play', () => {
      this.commit('doctorLesson/UPDATE_LOADING', true)
      const duration = getFallBackDuration(Math.round(sound.duration), transformDurationStr(data.duration))
      this.commit('doctorLesson/UPDATE_DURATION', duration)
      this.commit('doctorLesson/UPDATE_STATUS', true)
      requestAnimationFrame(this.commit.bind(this, 'doctorLesson/STEP'))
    })
    // 加载事件监听
    sound.addEventListener('canplay', () => {
      console.log('canplay')
      this.commit('doctorLesson/UPDATE_LOADING', false)
      const duration = getFallBackDuration(Math.round(sound.duration), transformDurationStr(data.duration))
      this.commit('doctorLesson/UPDATE_DURATION', duration)
      this.commit('doctorLesson/UPDATE_LOADING', false)
      this.commit('doctorLesson/UPDATE_STATUS', true)
      sound.play()
      if (commonIsApp && typeof mJavaScriptObject == 'object') {
        try {
          mJavaScriptObject.funPauseHealthCourseAudioPlayer()
        } catch (error) {
          return error
        }
      }
      const { id, is_free } = state.audioList[state.audioIndex]
      if (id == state.submitId) return

      const recordParams = {
        section_id: id,
        is_free: is_free,
        class_id: state.classId,
        channel_id: getSafeCid()
      }
      service.doctorLesson.addPlayRecord(recordParams).then(res => {
        if (res.state == -1) {
          console.log(res.msg)
        } else {
          if (res.data && res.data.id) {
            this.commit('doctorLesson/UPDATE_SUBMIT_ID', id)
          } else {
            console.log('未登录，听课记录提交失败')
          }
        }
      })
    })
    sound.addEventListener('load', () => {
      console.log('load')
      this.commit('doctorLesson/UPDATE_LOADING', true)
    })
    sound.addEventListener('error', () => {
      console.log('error', sound.error)
      Toast('音频播放出错...')
    })
    sound.addEventListener('abort', () => {
      console.log('abort', sound.error)
    })
    sound.addEventListener('suspend', () => {
      console.log('suspend')
      // 持续播放中会进入挂起状态
      this.commit('doctorLesson/UPDATE_LOADING', false)
    })
    sound.addEventListener('resume', () => {
      console.log('resume', sound.error)
    })
    sound.addEventListener('waiting', () => {
      this.commit('doctorLesson/UPDATE_LOADING', true)
      console.log('waiting', sound.error)
    })
    sound.addEventListener('playing', () => {
      this.commit('doctorLesson/UPDATE_LOADING', false)
      console.log('playing duration', state.duration)
      if (state.memoryPlay) {
        this.commit('doctorLesson/SEEK', state.memoryData.percentage)
      }
    })
    sound.addEventListener('close', () => {
      console.log('close', sound.error)
    })
    sound.load()
    // 先播放再停止
    // sound.play()
    // sound.stop()
    // }
  },
  // 音频暂停
  [doctorLesson.PAUSE](state) {
    if (sound && sound.tagName == 'AUDIO') {
      sound.pause()
    }
    // else {
    //     sound.pause(state.soundId)
    // }
    this.commit('doctorLesson/UPDATE_STATUS', false)
    this.commit('doctorLesson/RECORD_LASTEST_LESSON')
  },
  // 音频操作上下一首
  [doctorLesson.SKIP](state, direction) {
    let index = 0
    if (direction === 'prev') {
      index = state.audioIndex - 1
      if (index < 0) {
        this.commit('doctorLesson/UPDATE_STATUS', false)
        return false
      } else {
        // 在播放详情页面时更新当前 url
        const current = router.history.current
        if (current.name == 'lessonDetail') {
          router.replace({
            name: current.name,
            query: Object.assign({}, current.query, {
              classId: current.query.classId,
              fileId: state.audioList[index].file_id
            })
          })
        }
        this.commit('doctorLesson/SKIPTO', index)
        return true
      }
    } else {
      index = state.audioIndex + 1
      if (index >= state.audioList.length) {
        this.commit('doctorLesson/UPDATE_STATUS', false)
        return false
      } else {
        // 在播放详情页面时更新当前 url
        const current = router.history.current
        if (current.name == 'lessonDetail') {
          router.replace({
            name: current.name,
            query: Object.assign({}, current.query, {
              classId: current.query.classId,
              fileId: state.audioList[index].file_id
            })
          })
        }
      }
      this.commit('doctorLesson/SKIPTO', index)
      return true
    }
  },
  // 音频切换
  [doctorLesson.SKIPTO](state, index) {
    if (!sound) return
    if (sound.tagName == 'AUDIO') {
      sound.pause()
    }
    // else {
    //     sound.stop(state.soundId)
    // }
    this.commit('doctorLesson/UPDATE_CURRENTTIME', 0)
    this.commit('doctorLesson/PLAY', index)
  },
  // 音频跳时长
  [doctorLesson.SEEK](state, percentage) {
    if (!sound) return
    if (sound.tagName == 'AUDIO') {
      console.log('state.duration * percentage', state.duration, percentage)
      sound.currentTime = state.duration * percentage
      requestAnimationFrame(this.commit.bind(this, 'doctorLesson/STEP'))
    }
    if (state.memoryPlay) {
      this.commit('doctorLesson/UPDATE_MEMORY_DATA', {})
      this.commit('doctorLesson/UPDATE_MEMORY_PLAY', false)
    }
    // else if (sound.playing(state.soundId)) {
    //     sound.seek(sound.duration(state.soundId) * percentage)
    //     requestAnimationFrame(this.commit.bind(this, 'doctorLesson/STEP'))
    // }
  },
  // 音频时长步进
  [doctorLesson.STEP](state) {
    if (sound && sound.tagName == 'AUDIO') {
      const seek = sound.currentTime
      if (!isNaN(Math.round(seek))) {
        this.commit('doctorLesson/UPDATE_CURRENTTIME', Math.round(seek))
      }
      if (!sound.paused) {
        requestAnimationFrame(this.commit.bind(this, 'doctorLesson/STEP'))
      }
    }
    // else if (sound) {
    //     let seek = sound.seek(state.soundId)
    //     if (!isNaN(Math.round(seek))) {
    //         this.commit('doctorLesson/UPDATE_CURRENTTIME', Math.round(seek))
    //     }
    //     if (requestAnimationFrame(sound.playing.bind(sound))) {
    //         requestAnimationFrame(this.commit.bind(this, 'doctorLesson/STEP'))
    //     }
    // }
  },
  // 更新 classId
  [doctorLesson.UPDATE_CLASSID](state, classId) {
    state.classId = classId
  },
  // 更新 fileId
  [doctorLesson.UPDATE_FILEID](state, fileId) {
    state.fileId = fileId
    const index = state.audioList.findIndex(item => item.file_id == fileId)
    this.commit('doctorLesson/UPDATE_INDEX', index)
  },
  // 更新音频索引
  [doctorLesson.UPDATE_INDEX](state, index) {
    state.audioIndex = index
  },
  // 设置播放列表
  [doctorLesson.SET_AUDIOLIST](state, list) {
    state.audioList = list
  },
  // 更新 loading 状态
  [doctorLesson.UPDATE_LOADING](state, status) {
    state.loading = status
  },
  // 更新音频时长
  [doctorLesson.UPDATE_DURATION](state, duration) {
    state.duration = duration
  },
  // 更新播放状态
  [doctorLesson.UPDATE_STATUS](state, status) {
    state.playStatus = status
  },
  // 更新当前时间
  [doctorLesson.UPDATE_CURRENTTIME](state, number) {
    state.currentTime = number
  },
  [doctorLesson.UPDATE_BUY](state, boolean) {
    state.isBuy = boolean
  },
  [doctorLesson.UPDATE_UTOKEN](state, token) {
    state.utoken = token
  },
  // [doctorLesson.UPDATE_SOUNDID](state, number) {
  //     console.log('update soundId', number)
  //     state.soundId = number
  // },
  // 记录播放数据
  [doctorLesson.RECORD_LASTEST_LESSON](state) {
    if (!state.classId || !state.fileId || !state.currentTime) return
    // 如果未登录，localStorage.getItem('user_id') == null
    var userId = localStorage.getItem('user_id') || 0
    var temp = localStorage.getItem('recordLesson')
    // 清除之前的记录
    localStorage.removeItem('recordLesson')
    // 开始计算
    var recordLesson = temp ? JSON.parse(temp) : {}
    var currentUserRecord = recordLesson[userId] || []
    if (currentUserRecord) {
      // 前提：用户登录态
      // 规则：记录"每节课"&&"最新一节"音频的播放进度，保存用户的收听记录点，下次点击“免费收听/播放全部”时在该课程最新一条的播放记录上续播
      const index = currentUserRecord.findIndex(item => item.classId == state.classId)
      // 避免 currentTime 是 NaN
      const currentTime = Number.isNaN(state.currentTime) ? 0 : state.currentTime
      const record = {
        classId: state.classId,
        fileId: state.fileId,
        percentage: parseFloat(currentTime, 10) / state.duration // 范围 0 ~ 1
      }
      if (index >= 0) {
        currentUserRecord.splice(index, 1, record)
      } else {
        currentUserRecord.push(record)
      }
      recordLesson[userId] = currentUserRecord
    }
    localStorage.setItem('recordLesson', JSON.stringify(recordLesson))
  }
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations
}
