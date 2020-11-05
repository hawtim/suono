"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleTonSuono = exports.Suono = void 0;
function commonProxySingleton(FunClass) {
    var instance;
    return function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        if (!instance) {
            instance = new (FunClass.bind.apply(FunClass, __spreadArrays([void 0], rest)))();
        }
        return instance;
    };
}
function randomNumberBoth(min, max) {
    var range = max - min;
    var random = Math.random();
    var number = min + Math.round(random * range);
    return number;
}
var EventMap;
(function (EventMap) {
    EventMap[EventMap["abort"] = 0] = "abort";
    EventMap[EventMap["audioprocess"] = 1] = "audioprocess";
    EventMap[EventMap["canplay"] = 2] = "canplay";
    EventMap[EventMap["canplaythrough"] = 3] = "canplaythrough";
    EventMap[EventMap["complete"] = 4] = "complete";
    EventMap[EventMap["durationchange"] = 5] = "durationchange";
    EventMap[EventMap["emptied"] = 6] = "emptied";
    EventMap[EventMap["ended"] = 7] = "ended";
    EventMap[EventMap["encrypted"] = 8] = "encrypted";
    EventMap[EventMap["error"] = 9] = "error";
    EventMap[EventMap["loadeddata"] = 10] = "loadeddata";
    EventMap[EventMap["loadedmetadata"] = 11] = "loadedmetadata";
    EventMap[EventMap["interruptbegin"] = 12] = "interruptbegin";
    EventMap[EventMap["interruptend"] = 13] = "interruptend";
    EventMap[EventMap["loadstart"] = 14] = "loadstart";
    EventMap[EventMap["mozaudioavailable"] = 15] = "mozaudioavailable";
    EventMap[EventMap["pause"] = 16] = "pause";
    EventMap[EventMap["play"] = 17] = "play";
    EventMap[EventMap["playing"] = 18] = "playing";
    EventMap[EventMap["progress"] = 19] = "progress";
    EventMap[EventMap["ratechange"] = 20] = "ratechange";
    EventMap[EventMap["seeked"] = 21] = "seeked";
    EventMap[EventMap["seeking"] = 22] = "seeking";
    EventMap[EventMap["stalled"] = 23] = "stalled";
    EventMap[EventMap["suspend"] = 24] = "suspend";
    EventMap[EventMap["timeupdate"] = 25] = "timeupdate";
    EventMap[EventMap["volumechange"] = 26] = "volumechange";
    EventMap[EventMap["waiting"] = 27] = "waiting";
})(EventMap || (EventMap = {}));
var LoadErrMap = {
    1: 'MEDIA_ERR_ABORTED',
    2: 'MEDIA_ERR_NETWORK',
    3: 'MEDIA_ERR_DECODE',
    4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
};
var NetworkErrMap = {
    0: 'NETWORK_EMPTY',
    1: 'NETWORK_IDLE',
    2: 'NETWORK_LOADING',
    3: 'NETWORK_NO_SOURCE'
};
var SourceTypeMap = {
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
};
var SuonoEvent = (function () {
    function SuonoEvent() {
        this.clientList = {};
    }
    SuonoEvent.prototype.listen = function (key, callback) {
        if (!this.clientList[key]) {
            this.clientList[key] = [];
        }
        this.clientList[key].push(callback);
    };
    SuonoEvent.prototype.trigger = function (key) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        var callbacks = this.clientList[key];
        if (!callbacks || callbacks.length === 0) {
            return false;
        }
        for (var _a = 0, callbacks_1 = callbacks; _a < callbacks_1.length; _a++) {
            var callback = callbacks_1[_a];
            callback.apply(this, rest);
        }
    };
    SuonoEvent.prototype.remove = function (key, callback) {
        var callbacks = this.clientList[key];
        if (!callbacks) {
            return false;
        }
        if (!callback) {
            if (callbacks) {
                callbacks.length = 0;
            }
            return;
        }
        for (var length_1 = callbacks.length - 1; length_1 >= 0; length_1--) {
            var _callback = callbacks[length_1];
            if (_callback === callback) {
                callbacks.splice(length_1, 1);
            }
        }
    };
    return SuonoEvent;
}());
var Suono = (function () {
    function Suono(options, playList) {
        if (options === void 0) { options = {}; }
        var baseOptions = {
            autoplay: false,
            controls: false,
            preload: 'metadata',
            fallback: 'Your browser doesn\'t support HTML5 audio.',
            autoSkip: true,
            volume: 1,
            mode: 'order',
            debug: false,
            crossorigin: 'anonymous'
        };
        var opt = Object.assign({}, baseOptions, options);
        this.timestamp = +new Date;
        this.duration = 0;
        this.loop = false;
        this.name = '';
        this.src = '';
        this.debug = opt.debug;
        this.loading = false;
        this.fallback = opt.fallback;
        this.autoplay = opt.autoplay;
        this.crossorigin = opt.crossorigin;
        this.preload = opt.preload;
        this.controls = opt.controls;
        this.sound = null;
        this.volume = opt.volume;
        this.playList = playList || [];
        this.currentIndex = 0;
        this.autoSkip = opt.autoSkip;
        this.mode = opt.mode;
        this.playType = {
            order: this.order,
            singleLoop: this.singleLoop,
            shuffle: this.shuffle,
            listLoop: this.listLoop
        };
        this.suonoEvent = new SuonoEvent();
    }
    Suono.prototype.init = function (_a) {
        var src = _a.src, name = _a.name;
        if (!src) {
            throw new Error('Invalid audio source');
        }
        this.playList.push({
            src: src, name: name
        });
        this.sound = document.createElement('audio');
        this.setId();
        this.updatePreload(this.preload);
        this.updateControls(this.controls);
        this.handleEvent();
        this.switch({
            src: src, name: name
        });
    };
    Suono.prototype.updateAudio = function (src) {
        if (Array.isArray(src)) {
            var fragment_1 = document.createDocumentFragment();
            src.forEach(function (item) {
                var source = document.createElement('source');
                var temp = item.split('.');
                var ext = temp[temp.length - 1];
                source.src = item;
                source.type = SourceTypeMap[ext] ? SourceTypeMap[ext][0] : '';
                fragment_1.appendChild(source);
            });
            this.sound.appendChild(fragment_1);
        }
        else {
            this.sound.src = src;
        }
        if (this.fallback) {
            var fragment = document.createDocumentFragment();
            var paragraph = document.createElement('p');
            paragraph.innerText = this.fallback;
            fragment.appendChild(paragraph);
            this.sound.appendChild(fragment);
        }
    };
    Suono.prototype.appendChild = function () {
        document.body.appendChild(this.sound);
    };
    Suono.prototype.removeChild = function () {
        document.body.removeChild(this.sound);
    };
    Suono.prototype.destroy = function () {
        this.suonoEvent.trigger('beforeDeStroy', this);
        this.pause();
        this.removeEvent();
        this.sound = null;
    };
    Suono.prototype.load = function () {
        this.sound.load();
    };
    Suono.prototype.play = function () {
        void this.sound.play();
    };
    Suono.prototype.pause = function () {
        this.sound.pause();
    };
    Suono.prototype.seek = function (target) {
        if (target >= this.duration) {
            this.sound.currentTime = this.duration;
        }
        else {
            this.sound.currentTime = target;
        }
    };
    Suono.prototype.skipTo = function (listItem) {
        var index = this.playList.findIndex(function (item) { return item === listItem; });
        this.pause();
        this.switch(this.playList[index]);
    };
    Suono.prototype.prev = function () {
        if (this.playList.length === 0) {
            return;
        }
        if (this.mode === 'shuffle') {
            return this.shuffle();
        }
        if (this.currentIndex === 0) {
            this.currentIndex = this.playList.length - 1;
        }
        else {
            this.currentIndex -= 1;
        }
        this.switch(this.playList[this.currentIndex]);
    };
    Suono.prototype.next = function () {
        if (this.playList.length === 0) {
            return;
        }
        if (this.mode === 'shuffle') {
            return this.shuffle();
        }
        this.currentIndex = this.getRandomIndex();
        if (this.currentIndex === this.playList.length - 1) {
            this.currentIndex = 0;
        }
        else {
            this.currentIndex += 1;
        }
        this.switch(this.playList[this.currentIndex]);
    };
    Suono.prototype.switch = function (_a) {
        var name = _a.name, src = _a.src;
        this.updateAudio(src);
        this.name = name || 'unknown';
        this.load();
        void this.play();
    };
    Suono.prototype.order = function () {
        if (this.currentIndex === this.playList.length - 1) {
            return;
        }
        this.next();
    };
    Suono.prototype.singleLoop = function () {
        this.updateLoop(true);
    };
    Suono.prototype.shuffle = function () {
        this.currentIndex = this.getRandomIndex();
        this.switch(this.playList[this.currentIndex]);
    };
    Suono.prototype.listLoop = function () {
        this.next();
    };
    Suono.prototype.setId = function (id) {
        this.sound.id = id ? id : String(this.timestamp);
    };
    Suono.prototype.getId = function () {
        return this.timestamp;
    };
    Suono.prototype.getRandomIndex = function () {
        if (this.playList.length === 1) {
            return 0;
        }
        if (this.playList.length === 2) {
            return Math.abs(this.currentIndex - 1);
        }
        var index = randomNumberBoth(0, this.playList.length - 1);
        var maxIndex = this.playList.length - 1;
        if (index === this.currentIndex) {
            if (index === maxIndex) {
                return 0;
            }
            else {
                return index + 1;
            }
        }
        return index;
    };
    Suono.prototype.getName = function () {
        return this.name;
    };
    Suono.prototype.getSrc = function () {
        return this.sound.src;
    };
    Suono.prototype.getCurrentSrc = function () {
        return this.sound.currentSrc;
    };
    Suono.prototype.getCurrentTime = function () {
        return this.sound.currentTime;
    };
    Suono.prototype.getList = function () {
        return this.playList;
    };
    Suono.prototype.updateLoop = function (status) {
        this.loop = status;
        this.sound.loop = status;
    };
    Suono.prototype.updateName = function (name, src) {
        this.playList = this.playList.map(function (item) {
            if (item.src === src) {
                item.name = name;
            }
            return item;
        });
    };
    Suono.prototype.updatePreload = function (type) {
        this.preload = type;
        this.sound.preload = type;
    };
    Suono.prototype.updateControls = function (status) {
        this.controls = status;
        this.sound.controls = status;
    };
    Suono.prototype.updateLoading = function (status) {
        this.loading = status;
    };
    Suono.prototype.updateDuration = function (duration) {
        this.duration = duration;
    };
    Suono.prototype.updateMode = function (mode) {
        this.mode = mode;
    };
    Suono.prototype.updateList = function (list) {
        var _this = this;
        var index = list.findIndex(function (item) { return item.src === _this.getSrc(); });
        if (index >= 0) {
            this.currentIndex = index;
        }
        else {
            this.playList = this.playList.concat(list);
        }
    };
    Suono.prototype.debugConsole = function (string) {
        if (this.debug) {
            console.log(string);
        }
    };
    Suono.prototype.bindEvent = function () {
        var _this = this;
        Object.keys(EventMap).forEach(function (key) {
            _this.sound.addEventListener(key, function () {
                _this.debugConsole(key);
                _this.suonoEvent.trigger(key, _this);
            });
        });
    };
    Suono.prototype.removeEvent = function () {
        var _this = this;
        Object.keys(EventMap).forEach(function (key) {
            _this.sound.removeEventListener(key, function () {
                _this.suonoEvent.remove(key, function () {
                    _this.debugConsole(key);
                    _this.suonoEvent.trigger(key, _this);
                });
            });
        });
    };
    Suono.prototype.handleEvent = function () {
        var _this = this;
        this.bindEvent();
        this.suonoEvent.listen('durationchange', function () {
            _this.updateDuration(Math.round(_this.sound.duration));
        });
        this.suonoEvent.listen('play', function () {
            _this.updateLoading(true);
        });
        this.suonoEvent.listen('playing', function () {
            _this.debugConsole("" + String(NetworkErrMap[_this.sound.networkState]));
            if (_this.sound.networkState === 2) {
                _this.updateLoading(true);
                return;
            }
            _this.updateLoading(false);
        });
        this.suonoEvent.listen('ended', function () {
            _this.playType[_this.mode].call(_this);
        });
        this.suonoEvent.listen('error', function () {
            _this.handleLoadError(_this.sound.error);
            if (_this.autoSkip) {
                _this.next();
            }
        });
        this.suonoEvent.listen('suspend', function () {
            _this.updateLoading(false);
        });
        this.suonoEvent.listen('waiting', function () {
            _this.updateLoading(true);
        });
    };
    Suono.prototype.handleLoadError = function (_a) {
        var code = _a.code;
        var suffix = ', Please refer to https://developer.mozilla.org/en-US/docs/Web/API/MediaError';
        try {
            throw new Error("" + String(LoadErrMap[code]) + suffix);
        }
        catch (error) {
            this.debugConsole(error.message);
        }
    };
    return Suono;
}());
exports.Suono = Suono;
var SingleTonSuono = commonProxySingleton(Suono);
exports.SingleTonSuono = SingleTonSuono;
