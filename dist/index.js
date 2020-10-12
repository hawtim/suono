"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function commonProxySingleton(funClass) {
    var instance;
    return function getInstance() {
        if (!instance) {
            instance = new funClass(arguments);
        }
        return instance;
    };
}
function randomNumBoth(min, max) {
    var range = max - min;
    var random = Math.random();
    var num = min + Math.round(random * range);
    return num;
}
var EventMap;
(function (EventMap) {
    EventMap[EventMap["abort"] = 0] = "abort";
    EventMap[EventMap["canplay"] = 1] = "canplay";
    EventMap[EventMap["canplaythrough"] = 2] = "canplaythrough";
    EventMap[EventMap["durationchange"] = 3] = "durationchange";
    EventMap[EventMap["emptied"] = 4] = "emptied";
    EventMap[EventMap["ended"] = 5] = "ended";
    EventMap[EventMap["encrypted"] = 6] = "encrypted";
    EventMap[EventMap["error"] = 7] = "error";
    EventMap[EventMap["loadeddata"] = 8] = "loadeddata";
    EventMap[EventMap["loadedmetadata"] = 9] = "loadedmetadata";
    EventMap[EventMap["interruptbegin"] = 10] = "interruptbegin";
    EventMap[EventMap["interruptend"] = 11] = "interruptend";
    EventMap[EventMap["loadstart"] = 12] = "loadstart";
    EventMap[EventMap["mozaudioavailable"] = 13] = "mozaudioavailable";
    EventMap[EventMap["pause"] = 14] = "pause";
    EventMap[EventMap["play"] = 15] = "play";
    EventMap[EventMap["playing"] = 16] = "playing";
    EventMap[EventMap["progress"] = 17] = "progress";
    EventMap[EventMap["ratechange"] = 18] = "ratechange";
    EventMap[EventMap["seeked"] = 19] = "seeked";
    EventMap[EventMap["seeking"] = 20] = "seeking";
    EventMap[EventMap["stalled"] = 21] = "stalled";
    EventMap[EventMap["suspend"] = 22] = "suspend";
    EventMap[EventMap["timeupdate"] = 23] = "timeupdate";
    EventMap[EventMap["volumechange"] = 24] = "volumechange";
    EventMap[EventMap["waiting"] = 25] = "waiting";
})(EventMap || (EventMap = {}));
var ErrMap = {
    '1': 'MEDIA_ERR_ABORTED',
    '2': 'MEDIA_ERR_NETWORK',
    '3': 'MEDIA_ERR_DECODE',
    '4': 'MEDIA_ERR_SRC_NOT_SUPPORTED'
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
        if (!callbacks || callbacks.length === 0)
            return false;
        for (var i = 0, callback; callback = callbacks[i++];) {
            callback.apply(this, rest);
        }
    };
    SuonoEvent.prototype.remove = function (key, callback) {
        var callbacks = this.clientList[key];
        if (!callbacks)
            return false;
        if (!callback) {
            callbacks && (callbacks.length = 0);
        }
        else {
            for (var length = callbacks.length - 1; length >= 0; length--) {
                var _callback = callbacks[length];
                if (_callback === callback) {
                    callbacks.splice(length, 1);
                }
            }
        }
    };
    return SuonoEvent;
}());
var Suono = (function () {
    function Suono(options, playList) {
        this.duration = 0;
        this.status = false;
        this.name = '';
        this.loading = false;
        this.controls = false;
        this.sound = null;
        this.volume = options.volume || 1;
        this.playList = playList || [];
        this.currentIndex = 0;
        this.autoSkip = true;
        this.mode = options.mode || 'order';
        this.playType = {
            order: this.order,
            singleLoop: this.singleLoop,
            random: this.random,
            listLoop: this.listLoop
        };
        this.suonoEvent = new SuonoEvent();
    }
    Suono.prototype.init = function (_a) {
        var src = _a.src, name = _a.name;
        if (!src)
            throw new Error('Invalid audio source');
        this.name = name || 'unknown';
        this.playList.push({
            src: src, name: name
        });
        this.sound = document.createElement('audio');
        this.sound.preload = 'metadata';
        this.sound.controls = false;
        this.handleEvent();
        if (!src) {
            throw new Error('not found');
        }
        this.sound.src = src;
        this.load();
    };
    Suono.prototype.load = function () {
        this.sound.load();
        this.updateDuration(this.sound.duration);
    };
    Suono.prototype.play = function () {
        this.sound.play();
    };
    Suono.prototype.pause = function () {
        this.sound.pause();
        this.updateStatus(false);
    };
    Suono.prototype.seek = function (target) {
        if (target >= this.duration) {
            this.sound.currentTime = this.duration;
        }
        else {
            this.sound.currentTime = target;
        }
    };
    Suono.prototype.skipTo = function (index) {
        this.pause();
        this.switch(this.playList[index]);
    };
    Suono.prototype.canplay = function () {
        this.updateLoading(false);
        this.updateDuration(Math.round(this.sound.duration));
        this.updateStatus(true);
    };
    Suono.prototype.prev = function () {
        if (!this.playList.length)
            return;
        this.pause();
        if (this.currentIndex === 0) {
            this.currentIndex = this.playList.length - 1;
        }
        else {
            this.currentIndex -= 1;
        }
        this.switch(this.playList[this.currentIndex]);
    };
    Suono.prototype.next = function () {
        if (!this.playList.length)
            return;
        this.pause();
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
        this.sound.src = src;
        this.name = name;
        this.load();
        this.play();
    };
    Suono.prototype.order = function () {
        if (this.currentIndex === this.playList.length - 1)
            return;
        this.next();
    };
    Suono.prototype.singleLoop = function () {
        this.switch(this.playList[this.currentIndex]);
    };
    Suono.prototype.random = function () {
        var index = randomNumBoth(0, this.playList.length - 1);
        this.currentIndex = index;
        this.switch(this.playList[index]);
    };
    Suono.prototype.listLoop = function () {
        this.next();
    };
    Suono.prototype.getName = function () {
        return this.name;
    };
    Suono.prototype.getSrc = function () {
        return this.sound.src;
    };
    Suono.prototype.getCurrentTime = function () {
        return this.sound.currentTime;
    };
    Suono.prototype.getList = function () {
        return this.playList;
    };
    Suono.prototype.updateName = function (name, src) {
        this.playList = this.playList.map(function (item) {
            if (item.src === src) {
                item.name = name;
            }
            return item;
        });
    };
    Suono.prototype.updateLoading = function (status) {
        this.loading = status;
    };
    Suono.prototype.updateDuration = function (duration) {
        this.duration = duration;
    };
    Suono.prototype.updateStatus = function (status) {
        this.status = status;
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
    Suono.prototype.handleEvent = function () {
        var _this = this;
        Object.keys(EventMap).forEach(function (key) {
            _this.sound.addEventListener(key, function () {
                console.log(key);
                _this.suonoEvent.trigger(key, _this);
            });
        });
        this.suonoEvent.listen('abort', function () {
            _this.handleLoadError(_this.sound.error);
        });
        this.suonoEvent.listen('canplay', function () {
            _this.canplay();
        });
        this.suonoEvent.listen('pause', function () {
            _this.pause();
        });
        this.suonoEvent.listen('play', function () {
            _this.updateLoading(true);
            _this.updateDuration(Math.round(_this.sound.duration));
            _this.updateStatus(true);
        });
        this.suonoEvent.listen('playing', function () {
            _this.updateLoading(false);
        });
        this.suonoEvent.listen('ended', function () {
            _this.playType[_this.mode].call(_this);
        });
        this.suonoEvent.listen('error', function () {
            _this.handleLoadError(_this.sound.error);
            if (_this.autoSkip) {
                _this.next();
                _this.playType[_this.mode].call(_this);
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
        var code = _a.code, message = _a.message;
        var suffix = ", Please refer to https://developer.mozilla.org/en-US/docs/Web/API/MediaError";
        throw new Error("" + ErrMap[code] + suffix);
    };
    return Suono;
}());
exports.Suono = Suono;
var SingleTonSuono = commonProxySingleton(Suono);
exports.SingleTonSuono = SingleTonSuono;
