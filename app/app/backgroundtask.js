"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.BackgroundTaskManager = exports.TaskState = void 0;
var async_storage_1 = require("@react-native-async-storage/async-storage");
var buffer_1 = require("buffer");
var cheyenne_1 = require("./cheyenne");
var react_native_1 = require("react-native");
var react_native_2 = require("react-native");
var constants_1 = require("./constants");
var zeroconf_1 = require("./zeroconf");
var BackgroundTaskModule = react_native_1.NativeModules.BackgroundTaskModule;
// note - patched version from
// https://github.com/jeffc/react-native-live-audio-stream
var react_native_live_audio_stream_1 = require("react-native-live-audio-stream");
var sleep = function (delay) {
    return new Promise(function (resolve) { return setTimeout(resolve, delay); });
};
var TaskState;
(function (TaskState) {
    // no info
    TaskState[TaskState["UNKNOWN"] = 0] = "UNKNOWN";
    // task tried to start but failed
    TaskState[TaskState["FAILED"] = 1] = "FAILED";
    // task is running
    TaskState[TaskState["RUNNING"] = 2] = "RUNNING";
    // task is not running (on purpose)
    TaskState[TaskState["STOPPED"] = 3] = "STOPPED";
})(TaskState = exports.TaskState || (exports.TaskState = {}));
var BackgroundTaskManager_ = /** @class */ (function () {
    function BackgroundTaskManager_() {
        var _this = this;
        // track the task state
        this.taskState = TaskState.UNKNOWN;
        // convenience function: sets the state and calls the callback
        this.setState = function (s) {
            _this.taskState = s;
            _this.taskStateCallback(s);
        };
        // callback for when the task state changes
        this.taskStateCallback = function (s) { };
        // callback setter
        // calls callback immediately with current state when set
        this.setTaskStateCallback = function (f) {
            if (f) {
                _this.taskStateCallback = f;
            }
            else {
                _this.taskStateCallback = function (s) { };
            }
        };
        // track enable state
        this.isEnabled = new Promise(function (resolve, fail) {
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var en_str, from_storage, e_1, en;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            en_str = "";
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, async_storage_1["default"].getItem(constants_1.STORAGE_KEY_RUN_BACKGROUND_TASK)];
                        case 2:
                            from_storage = _a.sent();
                            if (from_storage) {
                                en_str = from_storage === null || from_storage === void 0 ? void 0 : from_storage.toString();
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            console.error("Error getting task enable state: " + e_1);
                            fail(e_1);
                            return [3 /*break*/, 4];
                        case 4:
                            en = en_str === "true";
                            if (en_str === null) {
                                console.log("No enable state found. Setting to false.");
                                en = false;
                            }
                            resolve(en);
                            return [2 /*return*/];
                    }
                });
            }); })();
        });
        // callback for when the enable state is changed or set
        this.enableStateCallback = function (b) { };
        // callback setter
        // once enable state is known, calls callback
        this.setEnableStateCallback = function (f) {
            if (f) {
                _this.enableStateCallback = f;
            }
            else {
                _this.enableStateCallback = function (s) { };
            }
            _this.isEnabled.then(_this.enableStateCallback);
        };
        // enable or disable the task
        this.setEnabled = function (enable) {
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, async_storage_1["default"].setItem(constants_1.STORAGE_KEY_RUN_BACKGROUND_TASK, enable ? "true" : "false")];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_2 = _a.sent();
                            console.error("Error saving enable state: " + e_2);
                            return [3 /*break*/, 3];
                        case 3:
                            this.isEnabled = new Promise(function (resolve) { return resolve(enable); });
                            this.enableStateCallback(enable);
                            return [2 /*return*/];
                    }
                });
            }); })().then(function () { });
        };
        // actually run the task
        this.run_fn = function (taskData) { return __awaiter(_this, void 0, void 0, function () {
            var shouldRun, shouldStop, emitter, ok;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.taskState == TaskState.RUNNING) {
                            console.error("Background task is already running; not starting again!");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.isEnabled];
                    case 1:
                        shouldRun = _a.sent();
                        if (!shouldRun) {
                            console.log("Not running background task; is disabled");
                            this.setState(TaskState.STOPPED);
                            BackgroundTaskModule.stopService();
                            return [2 /*return*/];
                        }
                        console.log("Started background task");
                        shouldStop = new Promise(function (resolve) {
                            _this.stop_fn = resolve;
                        });
                        emitter = new react_native_1.NativeEventEmitter(BackgroundTaskModule);
                        emitter.addListener("hassmic.SpeechStart", function () {
                            console.log("Speech playback start");
                        });
                        emitter.addListener("hassmic.SpeechStop", function () {
                            console.log("Speech playback stop");
                        });
                        cheyenne_1.CheyenneSocket.setPlayAudioCallback(function (url, announce) {
                            console.log("Playing audio: '" + url + "' (announce=" + announce + ")");
                            _this.playAudio(url, announce);
                        });
                        cheyenne_1.CheyenneSocket.startServer();
                        console.log("Started server");
                        return [4 /*yield*/, zeroconf_1.ZeroconfManager.StartZeroconf()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, react_native_2.PermissionsAndroid.check(react_native_2.PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)];
                    case 3:
                        ok = _a.sent();
                        if (!ok) {
                            console.error("no permission; bailing");
                            this.setState(TaskState.FAILED);
                            return [2 /*return*/];
                        }
                        console.log("permissions okay, starting stream");
                        react_native_live_audio_stream_1["default"].init({
                            sampleRate: 16000,
                            channels: 1,
                            bitsPerSample: 16,
                            audioSource: 6,
                            wavFile: ""
                        });
                        // @ts-ignore: This error is some weird interaction between TS and Java
                        react_native_live_audio_stream_1["default"].on("RNLiveAudioStream.data", function (data) {
                            if (typeof data == "object") {
                                console.warn("Can't process: " + JSON.stringify(data));
                                return;
                            }
                            var chunk = buffer_1.Buffer.from(data, "base64");
                            cheyenne_1.CheyenneSocket.streamAudio(chunk);
                        });
                        react_native_live_audio_stream_1["default"].start();
                        console.log("stream started");
                        this.setState(TaskState.RUNNING);
                        console.log("Background task running, awaiting stop signal");
                        return [4 /*yield*/, shouldStop];
                    case 4:
                        _a.sent();
                        console.log("Background task got stop signal, stopping");
                        react_native_live_audio_stream_1["default"].stop();
                        cheyenne_1.CheyenneSocket.stopServer();
                        BackgroundTaskModule.stopService();
                        zeroconf_1.ZeroconfManager.StopZeroconf();
                        this.setState(TaskState.STOPPED);
                        return [2 /*return*/];
                }
            });
        }); };
        // stop_fun is set by run() to the resolver on a promise. run() then runs
        // until that promise is fulfilled.
        this.stop_fn = null;
        // stop the current run by resolving the promise using stop_fn.
        this.stop = function () {
            if (_this.stop_fn) {
                _this.stop_fn();
            }
            else {
                console.error("Called stop() on background task, but it doesn't appear to be running");
            }
        };
        // kill any existing instance of the task
        this.kill = function () {
            try {
                BackgroundTaskModule.stopService();
            }
            catch (e) { }
        };
        // start the task
        this.run = function () {
            BackgroundTaskModule.startService();
        };
        // play some audio
        this.playAudio = function (url, announce) {
            BackgroundTaskModule.playAudio(url, announce);
        };
    }
    return BackgroundTaskManager_;
}());
exports.BackgroundTaskManager = new BackgroundTaskManager_();
