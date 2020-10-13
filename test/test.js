// import { Suono, SingleTonSuono } from '../dist/index.esm.js'
const { JSDOM } = require('jsdom')
const sinon = require('sinon')
const { Suono, SingleTonSuono } = require('../dist/index.js')
const test = require('ava')

// Global attach document for dom test, https://stackoverflow.com/a/55926916/12660113
test.beforeEach(() => {
  global.document = new JSDOM().window.document
  global.window = new JSDOM().window
})

test('singleton', t => {
  var suono = new SingleTonSuono({
    mode: 'random'
  })
  var suono1 = new SingleTonSuono()
  t.is(suono1 === suono, true)
})

test('foo', t => {
  t.pass()
  // console.log(Object.keys(t))
})

test('bar', async t => {
	const bar = Promise.resolve('bar')
	t.is(await bar, 'bar')
})

test('init', t => {
  global.window.HTMLMediaElement.prototype.load = () => {
    console.log(this)
  }
  const suono = new Suono()
  const item = {
    name: 'wave',
    src: 'https://hawtim.com/wave.mp3'
  }
  suono.init(item)
  t.is(suono.sound.src, item.src)
})
test('load', async t => {
  global.window.HTMLMediaElement.prototype.load = () => {
    console.log(this)
  }
  global.window.HTMLMediaElement.prototype.play = () => {
    console.log(this)
  }
  global.window.HTMLMediaElement.prototype.pause = () => { /* do nothing */ }
  global.window.HTMLMediaElement.prototype.addTextTrack = () => { /* do nothing */ }

  const suono = new Suono()
  const item = {
    name: 'wave',
    src: 'https://hawtim.com/wave.mp3'
  }
  suono.init(item)
})

test('play', t => {
  const suono = new Suono()
  const item = {
    name: 'wave',
    src: 'https://hawtim.com/wave.mp3'
  }
  suono.init(item)
  suono.play()
})
test('pause', t => {
  const suono = new Suono()
  const item = {
    name: 'wave',
    src: 'https://hawtim.com/wave.mp3'
  }
  suono.init(item)
  suono.pause()
})
test('listen', t => {
  
})
test('seek', t => {

})
test('skipTo', t => {

})
test('canplay', t => {

})
test('prev', t => {

})
test('next', t => {

})
test('switch', t => {

})
test('order', t => {

})
test('singleLoop', t => {

})
test('random', t => {

})
test('listLoop', t => {

})
test('getName', t => {

})
test('getSrc', t => {

})
test('getCurrentTime', t => {

})
test('getList', t => {

})
test('updateName', t => {

})
test('updateLoading', t => {

})
test('updateDuration', t => {

})
test('updateStatus', t => {

})
test('updateMode', t => {

})
test('updateList', t => {

})
test('handleEvent', t => {

})
test('handleLoadError', t => {

})