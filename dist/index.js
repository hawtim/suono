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
var ReadyStateMap = {
    0: 'HAVE_NOTHING',
    1: 'HAVE_METADATA',
    2: 'HAVE_CURRENT_DATA',
    3: 'HAVE_FUTURE_DATA',
    4: 'HAVE_ENOUGH_DATA'
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
        this.duration = 0;
        this.status = false;
        this.name = '';
        this.loading = false;
        this.controls = false;
        this.sound = null;
        this.volume = options.volume || 1;
        this.playList = playList || [];
        this.currentIndex = 0;
        this.autoSkip = options.autoSkip || true;
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
        if (!src) {
            throw new Error('Invalid audio source');
        }
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
    };
    Suono.prototype.play = function () {
        void this.sound.play();
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
    Suono.prototype.skipTo = function (listItem) {
        var index = this.playList.findIndex(function (item) { return item === listItem; });
        this.pause();
        this.switch(this.playList[index]);
    };
    Suono.prototype.canplay = function () {
        this.updateLoading(false);
        this.updateDuration(Math.round(this.sound.duration));
        this.updateStatus(true);
    };
    Suono.prototype.prev = function () {
        if (this.playList.length === 0) {
            return;
        }
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
        if (this.playList.length === 0) {
            return;
        }
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
        void this.play();
    };
    Suono.prototype.order = function () {
        if (this.currentIndex === this.playList.length - 1) {
            return;
        }
        this.next();
    };
    Suono.prototype.singleLoop = function () {
        this.switch(this.playList[this.currentIndex]);
    };
    Suono.prototype.random = function () {
        var index = randomNumberBoth(0, this.playList.length - 1);
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
        this.suonoEvent.listen('canplay', function () {
            _this.canplay();
        });
        this.suonoEvent.listen('durationchange', function () {
            _this.updateDuration(Math.round(_this.sound.duration));
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
            console.log("" + String(NetworkErrMap[_this.sound.networkState]));
            if (_this.sound.networkState === 2) {
                _this.updateLoading(true);
            }
            if (_this.sound.networkState === 3 || _this.sound.networkState === 4) {
                _this.updateLoading(false);
            }
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
        var code = _a.code;
        var suffix = ', Please refer to https://developer.mozilla.org/en-US/docs/Web/API/MediaError';
        throw new Error("" + String(LoadErrMap[code]) + suffix);
    };
    return Suono;
}());
exports.Suono = Suono;
var SingleTonSuono = commonProxySingleton(Suono);
exports.SingleTonSuono = SingleTonSuono;
