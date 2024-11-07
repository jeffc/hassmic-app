"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.ClientMessage = exports.ClientEventOccurred = exports.AudioData = exports.Ping = exports.ClientInfo = exports.ClientEvent = void 0;
var runtime_1 = require("@protobuf-ts/runtime");
var runtime_2 = require("@protobuf-ts/runtime");
var runtime_3 = require("@protobuf-ts/runtime");
var runtime_4 = require("@protobuf-ts/runtime");
/**
 * Events that the client wants to make the server aware of
 *
 * @generated from protobuf enum hassmic.ClientEvent
 */
var ClientEvent;
(function (ClientEvent) {
    /**
     * @generated from protobuf enum value: UNKNOWN_EVENT = 0;
     */
    ClientEvent[ClientEvent["UNKNOWN_EVENT"] = 0] = "UNKNOWN_EVENT";
})(ClientEvent = exports.ClientEvent || (exports.ClientEvent = {}));
// @generated message type with reflection information, may provide speed optimized methods
var ClientInfo$Type = /** @class */ (function (_super) {
    __extends(ClientInfo$Type, _super);
    function ClientInfo$Type() {
        return _super.call(this, "hassmic.ClientInfo", [
            { no: 1, name: "version", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "uuid", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]) || this;
    }
    ClientInfo$Type.prototype.create = function (value) {
        var message = globalThis.Object.create((this.messagePrototype));
        message.version = "";
        message.uuid = "";
        if (value !== undefined)
            runtime_3.reflectionMergePartial(this, message, value);
        return message;
    };
    ClientInfo$Type.prototype.internalBinaryRead = function (reader, length, options, target) {
        var message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            var _a = reader.tag(), fieldNo = _a[0], wireType = _a[1];
            switch (fieldNo) {
                case /* string version */ 1:
                    message.version = reader.string();
                    break;
                case /* string uuid */ 2:
                    message.uuid = reader.string();
                    break;
                default:
                    var u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error("Unknown field " + fieldNo + " (wire type " + wireType + ") for " + this.typeName);
                    var d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    };
    ClientInfo$Type.prototype.internalBinaryWrite = function (message, writer, options) {
        /* string version = 1; */
        if (message.version !== "")
            writer.tag(1, runtime_1.WireType.LengthDelimited).string(message.version);
        /* string uuid = 2; */
        if (message.uuid !== "")
            writer.tag(2, runtime_1.WireType.LengthDelimited).string(message.uuid);
        var u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    };
    return ClientInfo$Type;
}(runtime_4.MessageType));
/**
 * @generated MessageType for protobuf message hassmic.ClientInfo
 */
exports.ClientInfo = new ClientInfo$Type();
// @generated message type with reflection information, may provide speed optimized methods
var Ping$Type = /** @class */ (function (_super) {
    __extends(Ping$Type, _super);
    function Ping$Type() {
        return _super.call(this, "hassmic.Ping", []) || this;
    }
    Ping$Type.prototype.create = function (value) {
        var message = globalThis.Object.create((this.messagePrototype));
        if (value !== undefined)
            runtime_3.reflectionMergePartial(this, message, value);
        return message;
    };
    Ping$Type.prototype.internalBinaryRead = function (reader, length, options, target) {
        return target !== null && target !== void 0 ? target : this.create();
    };
    Ping$Type.prototype.internalBinaryWrite = function (message, writer, options) {
        var u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    };
    return Ping$Type;
}(runtime_4.MessageType));
/**
 * @generated MessageType for protobuf message hassmic.Ping
 */
exports.Ping = new Ping$Type();
// @generated message type with reflection information, may provide speed optimized methods
var AudioData$Type = /** @class */ (function (_super) {
    __extends(AudioData$Type, _super);
    function AudioData$Type() {
        return _super.call(this, "hassmic.AudioData", [
            { no: 1, name: "data", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]) || this;
    }
    AudioData$Type.prototype.create = function (value) {
        var message = globalThis.Object.create((this.messagePrototype));
        message.data = new Uint8Array(0);
        if (value !== undefined)
            runtime_3.reflectionMergePartial(this, message, value);
        return message;
    };
    AudioData$Type.prototype.internalBinaryRead = function (reader, length, options, target) {
        var message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            var _a = reader.tag(), fieldNo = _a[0], wireType = _a[1];
            switch (fieldNo) {
                case /* bytes data */ 1:
                    message.data = reader.bytes();
                    break;
                default:
                    var u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error("Unknown field " + fieldNo + " (wire type " + wireType + ") for " + this.typeName);
                    var d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    };
    AudioData$Type.prototype.internalBinaryWrite = function (message, writer, options) {
        /* bytes data = 1; */
        if (message.data.length)
            writer.tag(1, runtime_1.WireType.LengthDelimited).bytes(message.data);
        var u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    };
    return AudioData$Type;
}(runtime_4.MessageType));
/**
 * @generated MessageType for protobuf message hassmic.AudioData
 */
exports.AudioData = new AudioData$Type();
// @generated message type with reflection information, may provide speed optimized methods
var ClientEventOccurred$Type = /** @class */ (function (_super) {
    __extends(ClientEventOccurred$Type, _super);
    function ClientEventOccurred$Type() {
        return _super.call(this, "hassmic.ClientEventOccurred", [
            { no: 1, name: "event", kind: "enum", T: function () { return ["hassmic.ClientEvent", ClientEvent]; } }
        ]) || this;
    }
    ClientEventOccurred$Type.prototype.create = function (value) {
        var message = globalThis.Object.create((this.messagePrototype));
        message.event = 0;
        if (value !== undefined)
            runtime_3.reflectionMergePartial(this, message, value);
        return message;
    };
    ClientEventOccurred$Type.prototype.internalBinaryRead = function (reader, length, options, target) {
        var message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            var _a = reader.tag(), fieldNo = _a[0], wireType = _a[1];
            switch (fieldNo) {
                case /* hassmic.ClientEvent event */ 1:
                    message.event = reader.int32();
                    break;
                default:
                    var u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error("Unknown field " + fieldNo + " (wire type " + wireType + ") for " + this.typeName);
                    var d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    };
    ClientEventOccurred$Type.prototype.internalBinaryWrite = function (message, writer, options) {
        /* hassmic.ClientEvent event = 1; */
        if (message.event !== 0)
            writer.tag(1, runtime_1.WireType.Varint).int32(message.event);
        var u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    };
    return ClientEventOccurred$Type;
}(runtime_4.MessageType));
/**
 * @generated MessageType for protobuf message hassmic.ClientEventOccurred
 */
exports.ClientEventOccurred = new ClientEventOccurred$Type();
// @generated message type with reflection information, may provide speed optimized methods
var ClientMessage$Type = /** @class */ (function (_super) {
    __extends(ClientMessage$Type, _super);
    function ClientMessage$Type() {
        return _super.call(this, "hassmic.ClientMessage", [
            { no: 1, name: "ping", kind: "message", oneof: "msg", T: function () { return exports.Ping; } },
            { no: 2, name: "client_info", kind: "message", oneof: "msg", T: function () { return exports.ClientInfo; } },
            { no: 3, name: "audio_data", kind: "message", oneof: "msg", T: function () { return exports.AudioData; } },
            { no: 4, name: "event_occurred", kind: "enum", oneof: "msg", T: function () { return ["hassmic.ClientEvent", ClientEvent]; } }
        ]) || this;
    }
    ClientMessage$Type.prototype.create = function (value) {
        var message = globalThis.Object.create((this.messagePrototype));
        message.msg = { oneofKind: undefined };
        if (value !== undefined)
            runtime_3.reflectionMergePartial(this, message, value);
        return message;
    };
    ClientMessage$Type.prototype.internalBinaryRead = function (reader, length, options, target) {
        var message = target !== null && target !== void 0 ? target : this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            var _a = reader.tag(), fieldNo = _a[0], wireType = _a[1];
            switch (fieldNo) {
                case /* hassmic.Ping ping */ 1:
                    message.msg = {
                        oneofKind: "ping",
                        ping: exports.Ping.internalBinaryRead(reader, reader.uint32(), options, message.msg.ping)
                    };
                    break;
                case /* hassmic.ClientInfo client_info */ 2:
                    message.msg = {
                        oneofKind: "clientInfo",
                        clientInfo: exports.ClientInfo.internalBinaryRead(reader, reader.uint32(), options, message.msg.clientInfo)
                    };
                    break;
                case /* hassmic.AudioData audio_data */ 3:
                    message.msg = {
                        oneofKind: "audioData",
                        audioData: exports.AudioData.internalBinaryRead(reader, reader.uint32(), options, message.msg.audioData)
                    };
                    break;
                case /* hassmic.ClientEvent event_occurred */ 4:
                    message.msg = {
                        oneofKind: "eventOccurred",
                        eventOccurred: reader.int32()
                    };
                    break;
                default:
                    var u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error("Unknown field " + fieldNo + " (wire type " + wireType + ") for " + this.typeName);
                    var d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? runtime_2.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    };
    ClientMessage$Type.prototype.internalBinaryWrite = function (message, writer, options) {
        /* hassmic.Ping ping = 1; */
        if (message.msg.oneofKind === "ping")
            exports.Ping.internalBinaryWrite(message.msg.ping, writer.tag(1, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* hassmic.ClientInfo client_info = 2; */
        if (message.msg.oneofKind === "clientInfo")
            exports.ClientInfo.internalBinaryWrite(message.msg.clientInfo, writer.tag(2, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* hassmic.AudioData audio_data = 3; */
        if (message.msg.oneofKind === "audioData")
            exports.AudioData.internalBinaryWrite(message.msg.audioData, writer.tag(3, runtime_1.WireType.LengthDelimited).fork(), options).join();
        /* hassmic.ClientEvent event_occurred = 4; */
        if (message.msg.oneofKind === "eventOccurred")
            writer.tag(4, runtime_1.WireType.Varint).int32(message.msg.eventOccurred);
        var u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? runtime_2.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    };
    return ClientMessage$Type;
}(runtime_4.MessageType));
/**
 * @generated MessageType for protobuf message hassmic.ClientMessage
 */
exports.ClientMessage = new ClientMessage$Type();
