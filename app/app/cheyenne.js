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
exports.CheyenneSocket = void 0;
var react_native_tcp_socket_1 = require("react-native-tcp-socket");
var util_1 = require("./util");
var constants_1 = require("./constants");
var hassmic_1 = require("./proto/hassmic");
// "Cheyenne" protocol server
var CheyenneServer = /** @class */ (function () {
    function CheyenneServer() {
        var _this = this;
        // Keep track of the socket
        this._sock = null;
        // also track the server object
        this._server = null;
        // the UUID for this device
        this._uuid = "";
        // settable callback for connection state
        this._connectionStateCallback = null;
        this.setConnectionStateCallback = function (cb) {
            _this._connectionStateCallback = cb;
        };
        this._setConnectionState = function (s) {
            var _a;
            (_a = _this._connectionStateCallback) === null || _a === void 0 ? void 0 : _a.call(_this, s);
        };
        // callback to play audio via URL
        this._playAudioCallback = null;
        this.setPlayAudioCallback = function (cb) {
            _this._playAudioCallback = cb;
        };
        this.streamAudio = function (streamData) {
            if (_this._sock) {
                try {
                    _this.sendMessage(hassmic_1.ClientMessage.create({
                        msg: {
                            oneofKind: "audioData",
                            audioData: {
                                data: streamData
                            }
                        }
                    }));
                }
                catch (e) {
                    console.info(e);
                }
            }
        };
        this.sendMessage = function (m) {
            if (_this._sock) {
                try {
                    _this._sock.write(hassmic_1.ClientMessage.toBinary(m));
                }
                catch (e) {
                    console.error(e);
                    console.error(e.stack);
                }
            }
        };
        this.sendInfo = function (uuid) {
            _this.sendMessage(hassmic_1.ClientMessage.create({
                msg: {
                    oneofKind: "clientInfo",
                    clientInfo: {
                        uuid: uuid,
                        version: constants_1.APP_VERSION
                    }
                }
            }));
        };
        // sends a ping every 10 seconds while the socket is open.
        this.startPing = function () {
            return (function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this._sock) return [3 /*break*/, 2];
                            try {
                                this.sendMessage(hassmic_1.ClientMessage.create({
                                    msg: {
                                        oneofKind: "ping",
                                        ping: {}
                                    }
                                }));
                            }
                            catch (e) {
                                console.info(e);
                            }
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 10 * 1e3); })];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 0];
                        case 2:
                            console.log("done ping");
                            return [2 /*return*/];
                    }
                });
            }); })().then(function () { });
        };
        this.startServer = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, util_1.UUIDManager.getUUID()];
                    case 1:
                        _a._uuid = _b.sent();
                        this._server = react_native_tcp_socket_1["default"].createServer(function (socket) {
                            socket.on("error", function (err) {
                                console.info("Socket error: " + err);
                            });
                            socket.on("close", function (err) {
                                console.info("Closed connection");
                                if (_this._sock == socket) {
                                    _this._sock = null;
                                }
                                _this._setConnectionState(false);
                            });
                            socket.on("timeout", function () {
                                console.info("Socket timed out");
                                socket.destroy();
                                _this._setConnectionState(false);
                            });
                            socket.on("data", function (d) {
                                _this._handleIncomingData(d.toString());
                            });
                            console.info("Got connection");
                            if (_this._sock == null) {
                                _this._sock = socket;
                                socket.setTimeout(60e3);
                                _this._setConnectionState(true);
                                _this.sendInfo(_this._uuid);
                                _this.startPing();
                                console.info("All set up -- waiting");
                            }
                            else {
                                console.info("Already have a socket, dropping new connection");
                                socket.destroy();
                            }
                        }).listen({ port: 11700, host: "0.0.0.0" });
                        return [2 /*return*/];
                }
            });
        }); };
        this.stopServer = function () { return __awaiter(_this, void 0, void 0, function () {
            var p;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("stopping server...");
                        p = new Promise(function (resolve) {
                            var _a;
                            (_a = _this._server) === null || _a === void 0 ? void 0 : _a.close(function () { return resolve(); });
                        });
                        (_a = this._sock) === null || _a === void 0 ? void 0 : _a.destroy();
                        return [4 /*yield*/, p];
                    case 1:
                        _b.sent();
                        console.log("Server stopped");
                        return [2 /*return*/];
                }
            });
        }); };
        this._handleIncomingData = function (d) { return __awaiter(_this, void 0, void 0, function () {
            var m, data, url, data, url;
            var _a, _b;
            return __generator(this, function (_c) {
                try {
                    m = JSON.parse(d.toString());
                    switch (m["type"]) {
                        case "play-announce":
                            {
                                console.info("Got play-announce message");
                                data = m["data"] || {};
                                url = data["url"] || "";
                                if (url) {
                                    console.log("Playing URL '" + url + "'");
                                    (_a = this._playAudioCallback) === null || _a === void 0 ? void 0 : _a.call(this, url, true);
                                }
                                else {
                                    console.warn("message.data.url is not set");
                                }
                            }
                            break;
                        case "play-audio":
                            {
                                console.info("Got play-audio message");
                                data = m["data"] || {};
                                url = data["url"] || "";
                                if (url) {
                                    console.log("Playing URL '" + url + "'");
                                    (_b = this._playAudioCallback) === null || _b === void 0 ? void 0 : _b.call(this, url, false);
                                }
                                else {
                                    console.warn("message.data.url is not set");
                                }
                            }
                            break;
                        default:
                            console.warn("Got unknown message type '" + m["type"] + "'");
                    }
                }
                catch (e) {
                    console.error(e);
                }
                return [2 /*return*/];
            });
        }); };
    }
    return CheyenneServer;
}());
exports.CheyenneSocket = new CheyenneServer();
