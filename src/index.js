"use strict";
exports.__esModule = true;
var Suono = /** @class */ (function () {
    // static getInstance() {
    //   let instance
    //   if (!instance) {
    //     instance = new Suono()
    //   }
    // }
    // 构造函数，可传入 list 或者后续再传
    function Suono(src, name, list) {
        this.duration = 0;
        this.status = false;
        this.src = src;
        this.name = name;
        this.loading = false;
        // 默认没有控制选项
        this.controls = false;
        this.sound = null;
        this.currentTime = 0;
        // 控制前后播放的相关参数
        this.list = list;
        this.currentIndex = 0;
    }
    // 初始化 audio 标签
    Suono.prototype.init = function (_a) {
        var src = _a.src, name = _a.name;
        this.name = name;
        this.src = src;
        this.sound = document.createElement('audio');
        // 避免加载整个音频文件，只先加载元信息
        this.sound.preload = 'metadata';
        this.sound.controls = false;
        // 添加各种监听事件
        this.attachEvent();
        if (!src) {
            throw new Error('未找到播放地址');
        }
        this.sound.src = src;
        // 加载资源
        this.load();
    };
    // 添加监听事件
    Suono.prototype.attachEvent = function () {
        var _this = this;
        this.sound.addEventListener('pause', function () {
            _this.pause();
        });
        this.sound.addEventListener('play', function () {
            _this.updateLoading(true);
            _this.updateDuration(Math.round(_this.sound.duration));
            _this.updateStatus(true);
            // 更新进度条
            // requestAnimationFrame(this.commit.bind(this, 'doctorLesson/STEP'))
        });
        this.sound.addEventListener('playing', function () {
            _this.updateLoading(false);
        });
        this.sound.addEventListener('canplay', function () {
            _this.canplay();
        });
        this.sound.addEventListener('load', function () {
            _this.updateLoading(true);
        });
        this.sound.addEventListener('error', function () {
            console.log('音频播放出错', _this.sound.error);
        });
        this.sound.addEventListener('suspend', function () {
            console.log('suspend');
            // 持续播放中会进入挂起状态
            _this.updateLoading(false);
        });
        this.sound.addEventListener('abort', function () {
            console.log('音频播放中断', _this.sound.error);
        });
        this.sound.addEventListener('resume', function () {
            console.log('音频播放恢复', _this.sound.error);
        });
        this.sound.addEventListener('waiting', function () {
            _this.updateLoading(true);
            console.log('音频等待中', _this.sound.error);
        });
        this.sound.addEventListener('close', function () {
            console.log('close', _this.sound.error);
        });
    };
    // 加载资源
    Suono.prototype.load = function () {
        this.sound.load();
    };
    Suono.prototype.play = function () {
        this.sound.play();
    };
    Suono.prototype.pause = function () {
        this.sound.pause();
        this.updateStatus(false);
    };
    Suono.prototype.canplay = function () {
        this.updateLoading(false);
        this.updateDuration(Math.round(this.sound.duration));
        this.updateStatus(true);
    };
    // 如果有列表，跳至上一首或者下一首
    Suono.prototype.prev = function () {
    };
    Suono.prototype.next = function () {
    };
    Suono.prototype.getName = function () {
        return this.name;
    };
    Suono.prototype.getSrc = function () {
        return this.src;
    };
    // 更新视图状态
    Suono.prototype.updateLoading = function (status) {
        this.loading = status;
    };
    Suono.prototype.updateDuration = function (duration) {
        this.duration = duration;
    };
    Suono.prototype.updateStatus = function (status) {
        this.status = status;
    };
    Suono.prototype.updateCurrentTime = function (number) {
        this.currentTime = number;
    };
    Suono.prototype.updateList = function (list) {
        var _this = this;
        // 检查当前 src 是否在列表中
        var index = list.findIndex(function (item) { return item.src === _this.src; });
        if (index >= 0) {
            this.currentIndex = index;
        }
        else {
            this.list = [{
                    src: this.src,
                    name: this.name
                }].concat(list);
        }
    };
    return Suono;
}());
exports.Suono = Suono;
exports["default"] = Suono;
