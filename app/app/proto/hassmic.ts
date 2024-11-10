// @generated by protobuf-ts 2.9.4
// @generated from protobuf file "hassmic.proto" (package "hassmic", syntax proto3)
// tslint:disable
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * Information that the client sends about itself
 *
 * @generated from protobuf message hassmic.ClientInfo
 */
export interface ClientInfo {
    /**
     * The version, for example "0.9.2"
     *
     * @generated from protobuf field: string version = 1;
     */
    version: string;
    /**
     * @generated from protobuf field: string uuid = 2;
     */
    uuid: string;
}
/**
 * A ping message
 *
 * @generated from protobuf message hassmic.Ping
 */
export interface Ping {
}
/**
 * @generated from protobuf message hassmic.AudioData
 */
export interface AudioData {
    /**
     * @generated from protobuf field: bytes data = 1;
     */
    data: Uint8Array;
}
/**
 * Tell the server that a client event occurred
 *
 * @generated from protobuf message hassmic.ClientEvent
 */
export interface ClientEvent {
    /**
     * @generated from protobuf oneof: event
     */
    event: {
        oneofKind: "mediaPlayerStateChange";
        /**
         * @generated from protobuf field: hassmic.ClientEvent.MediaPlayerStateChange media_player_state_change = 1;
         */
        mediaPlayerStateChange: ClientEvent_MediaPlayerStateChange;
    } | {
        oneofKind: "mediaPlayerVolumeChange";
        /**
         * @generated from protobuf field: hassmic.ClientEvent.MediaPlayerVolumeChange media_player_volume_change = 2;
         */
        mediaPlayerVolumeChange: ClientEvent_MediaPlayerVolumeChange;
    } | {
        oneofKind: "deviceVolumeChange";
        /**
         * @generated from protobuf field: hassmic.ClientEvent.DeviceVolumeChange device_volume_change = 3;
         */
        deviceVolumeChange: ClientEvent_DeviceVolumeChange;
    } | {
        oneofKind: undefined;
    };
}
/**
 * A media player has changed state
 *
 * @generated from protobuf message hassmic.ClientEvent.MediaPlayerStateChange
 */
export interface ClientEvent_MediaPlayerStateChange {
    /**
     * @generated from protobuf field: hassmic.MediaPlayerId player = 1;
     */
    player: MediaPlayerId;
    /**
     * @generated from protobuf field: hassmic.MediaPlayerState new_state = 2;
     */
    newState: MediaPlayerState;
}
/**
 * A media player has changed volume
 *
 * @generated from protobuf message hassmic.ClientEvent.MediaPlayerVolumeChange
 */
export interface ClientEvent_MediaPlayerVolumeChange {
    /**
     * @generated from protobuf field: hassmic.MediaPlayerId player = 1;
     */
    player: MediaPlayerId;
    /**
     * @generated from protobuf field: float new_volume = 2;
     */
    newVolume: number;
}
/**
 * The device volume has changed
 *
 * @generated from protobuf message hassmic.ClientEvent.DeviceVolumeChange
 */
export interface ClientEvent_DeviceVolumeChange {
    /**
     * @generated from protobuf field: float new_volume = 1;
     */
    newVolume: number;
}
/**
 * The wrapper message that actually gets sent to the server
 *
 * @generated from protobuf message hassmic.ClientMessage
 */
export interface ClientMessage {
    /**
     * @generated from protobuf oneof: msg
     */
    msg: {
        oneofKind: "ping";
        /**
         * @generated from protobuf field: hassmic.Ping ping = 1;
         */
        ping: Ping;
    } | {
        oneofKind: "clientInfo";
        /**
         * @generated from protobuf field: hassmic.ClientInfo client_info = 2;
         */
        clientInfo: ClientInfo;
    } | {
        oneofKind: "audioData";
        /**
         * @generated from protobuf field: hassmic.AudioData audio_data = 3;
         */
        audioData: AudioData;
    } | {
        oneofKind: "clientEvent";
        /**
         * @generated from protobuf field: hassmic.ClientEvent client_event = 4;
         */
        clientEvent: ClientEvent;
    } | {
        oneofKind: undefined;
    };
}
/**
 * Play an audio file
 *
 * @generated from protobuf message hassmic.PlayAudio
 */
export interface PlayAudio {
    /**
     * Whether this should be an announcement or not
     *
     * @generated from protobuf field: bool announce = 1;
     */
    announce: boolean;
    /**
     * The url to play
     *
     * @generated from protobuf field: string url = 2;
     */
    url: string;
}
/**
 * The wrapper message that gets sent from the server to the client
 *
 * @generated from protobuf message hassmic.ServerMessage
 */
export interface ServerMessage {
    /**
     * @generated from protobuf oneof: msg
     */
    msg: {
        oneofKind: "playAudio";
        /**
         * A command to play audio
         *
         * @generated from protobuf field: hassmic.PlayAudio play_audio = 1;
         */
        playAudio: PlayAudio;
    } | {
        oneofKind: "setMicMute";
        /**
         * Set whether the mic should be muted
         *
         * @generated from protobuf field: bool set_mic_mute = 2;
         */
        setMicMute: boolean;
    } | {
        oneofKind: undefined;
    };
}
/**
 * https://developer.android.com/reference/androidx/media3/common/Player.State
 *
 * @generated from protobuf enum hassmic.MediaPlayerState
 */
export enum MediaPlayerState {
    /**
     * @generated from protobuf enum value: STATE_UNKNOWN = 0;
     */
    STATE_UNKNOWN = 0,
    /**
     * @generated from protobuf enum value: STATE_IDLE = 1;
     */
    STATE_IDLE = 1,
    /**
     * @generated from protobuf enum value: STATE_BUFFERING = 2;
     */
    STATE_BUFFERING = 2,
    /**
     * @generated from protobuf enum value: STATE_READY = 3;
     */
    STATE_READY = 3,
    /**
     * @generated from protobuf enum value: STATE_ENDED = 4;
     */
    STATE_ENDED = 4
}
/**
 * The different media players available
 *
 * @generated from protobuf enum hassmic.MediaPlayerId
 */
export enum MediaPlayerId {
    /**
     * @generated from protobuf enum value: ID_UNKNOWN = 0;
     */
    ID_UNKNOWN = 0,
    /**
     * The normal music/audio playback player
     *
     * @generated from protobuf enum value: ID_PLAYBACK = 1;
     */
    ID_PLAYBACK = 1,
    /**
     * The announce player
     *
     * @generated from protobuf enum value: ID_ANNOUNCE = 2;
     */
    ID_ANNOUNCE = 2
}
// @generated message type with reflection information, may provide speed optimized methods
class ClientInfo$Type extends MessageType<ClientInfo> {
    constructor() {
        super("hassmic.ClientInfo", [
            { no: 1, name: "version", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "uuid", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<ClientInfo>): ClientInfo {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.version = "";
        message.uuid = "";
        if (value !== undefined)
            reflectionMergePartial<ClientInfo>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ClientInfo): ClientInfo {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string version */ 1:
                    message.version = reader.string();
                    break;
                case /* string uuid */ 2:
                    message.uuid = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ClientInfo, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string version = 1; */
        if (message.version !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.version);
        /* string uuid = 2; */
        if (message.uuid !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.uuid);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message hassmic.ClientInfo
 */
export const ClientInfo = new ClientInfo$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Ping$Type extends MessageType<Ping> {
    constructor() {
        super("hassmic.Ping", []);
    }
    create(value?: PartialMessage<Ping>): Ping {
        const message = globalThis.Object.create((this.messagePrototype!));
        if (value !== undefined)
            reflectionMergePartial<Ping>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Ping): Ping {
        return target ?? this.create();
    }
    internalBinaryWrite(message: Ping, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message hassmic.Ping
 */
export const Ping = new Ping$Type();
// @generated message type with reflection information, may provide speed optimized methods
class AudioData$Type extends MessageType<AudioData> {
    constructor() {
        super("hassmic.AudioData", [
            { no: 1, name: "data", kind: "scalar", T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
    create(value?: PartialMessage<AudioData>): AudioData {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.data = new Uint8Array(0);
        if (value !== undefined)
            reflectionMergePartial<AudioData>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AudioData): AudioData {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bytes data */ 1:
                    message.data = reader.bytes();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: AudioData, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bytes data = 1; */
        if (message.data.length)
            writer.tag(1, WireType.LengthDelimited).bytes(message.data);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message hassmic.AudioData
 */
export const AudioData = new AudioData$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ClientEvent$Type extends MessageType<ClientEvent> {
    constructor() {
        super("hassmic.ClientEvent", [
            { no: 1, name: "media_player_state_change", kind: "message", oneof: "event", T: () => ClientEvent_MediaPlayerStateChange },
            { no: 2, name: "media_player_volume_change", kind: "message", oneof: "event", T: () => ClientEvent_MediaPlayerVolumeChange },
            { no: 3, name: "device_volume_change", kind: "message", oneof: "event", T: () => ClientEvent_DeviceVolumeChange }
        ]);
    }
    create(value?: PartialMessage<ClientEvent>): ClientEvent {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.event = { oneofKind: undefined };
        if (value !== undefined)
            reflectionMergePartial<ClientEvent>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ClientEvent): ClientEvent {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* hassmic.ClientEvent.MediaPlayerStateChange media_player_state_change */ 1:
                    message.event = {
                        oneofKind: "mediaPlayerStateChange",
                        mediaPlayerStateChange: ClientEvent_MediaPlayerStateChange.internalBinaryRead(reader, reader.uint32(), options, (message.event as any).mediaPlayerStateChange)
                    };
                    break;
                case /* hassmic.ClientEvent.MediaPlayerVolumeChange media_player_volume_change */ 2:
                    message.event = {
                        oneofKind: "mediaPlayerVolumeChange",
                        mediaPlayerVolumeChange: ClientEvent_MediaPlayerVolumeChange.internalBinaryRead(reader, reader.uint32(), options, (message.event as any).mediaPlayerVolumeChange)
                    };
                    break;
                case /* hassmic.ClientEvent.DeviceVolumeChange device_volume_change */ 3:
                    message.event = {
                        oneofKind: "deviceVolumeChange",
                        deviceVolumeChange: ClientEvent_DeviceVolumeChange.internalBinaryRead(reader, reader.uint32(), options, (message.event as any).deviceVolumeChange)
                    };
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ClientEvent, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* hassmic.ClientEvent.MediaPlayerStateChange media_player_state_change = 1; */
        if (message.event.oneofKind === "mediaPlayerStateChange")
            ClientEvent_MediaPlayerStateChange.internalBinaryWrite(message.event.mediaPlayerStateChange, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* hassmic.ClientEvent.MediaPlayerVolumeChange media_player_volume_change = 2; */
        if (message.event.oneofKind === "mediaPlayerVolumeChange")
            ClientEvent_MediaPlayerVolumeChange.internalBinaryWrite(message.event.mediaPlayerVolumeChange, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* hassmic.ClientEvent.DeviceVolumeChange device_volume_change = 3; */
        if (message.event.oneofKind === "deviceVolumeChange")
            ClientEvent_DeviceVolumeChange.internalBinaryWrite(message.event.deviceVolumeChange, writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message hassmic.ClientEvent
 */
export const ClientEvent = new ClientEvent$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ClientEvent_MediaPlayerStateChange$Type extends MessageType<ClientEvent_MediaPlayerStateChange> {
    constructor() {
        super("hassmic.ClientEvent.MediaPlayerStateChange", [
            { no: 1, name: "player", kind: "enum", T: () => ["hassmic.MediaPlayerId", MediaPlayerId] },
            { no: 2, name: "new_state", kind: "enum", T: () => ["hassmic.MediaPlayerState", MediaPlayerState] }
        ]);
    }
    create(value?: PartialMessage<ClientEvent_MediaPlayerStateChange>): ClientEvent_MediaPlayerStateChange {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.player = 0;
        message.newState = 0;
        if (value !== undefined)
            reflectionMergePartial<ClientEvent_MediaPlayerStateChange>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ClientEvent_MediaPlayerStateChange): ClientEvent_MediaPlayerStateChange {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* hassmic.MediaPlayerId player */ 1:
                    message.player = reader.int32();
                    break;
                case /* hassmic.MediaPlayerState new_state */ 2:
                    message.newState = reader.int32();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ClientEvent_MediaPlayerStateChange, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* hassmic.MediaPlayerId player = 1; */
        if (message.player !== 0)
            writer.tag(1, WireType.Varint).int32(message.player);
        /* hassmic.MediaPlayerState new_state = 2; */
        if (message.newState !== 0)
            writer.tag(2, WireType.Varint).int32(message.newState);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message hassmic.ClientEvent.MediaPlayerStateChange
 */
export const ClientEvent_MediaPlayerStateChange = new ClientEvent_MediaPlayerStateChange$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ClientEvent_MediaPlayerVolumeChange$Type extends MessageType<ClientEvent_MediaPlayerVolumeChange> {
    constructor() {
        super("hassmic.ClientEvent.MediaPlayerVolumeChange", [
            { no: 1, name: "player", kind: "enum", T: () => ["hassmic.MediaPlayerId", MediaPlayerId] },
            { no: 2, name: "new_volume", kind: "scalar", T: 2 /*ScalarType.FLOAT*/ }
        ]);
    }
    create(value?: PartialMessage<ClientEvent_MediaPlayerVolumeChange>): ClientEvent_MediaPlayerVolumeChange {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.player = 0;
        message.newVolume = 0;
        if (value !== undefined)
            reflectionMergePartial<ClientEvent_MediaPlayerVolumeChange>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ClientEvent_MediaPlayerVolumeChange): ClientEvent_MediaPlayerVolumeChange {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* hassmic.MediaPlayerId player */ 1:
                    message.player = reader.int32();
                    break;
                case /* float new_volume */ 2:
                    message.newVolume = reader.float();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ClientEvent_MediaPlayerVolumeChange, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* hassmic.MediaPlayerId player = 1; */
        if (message.player !== 0)
            writer.tag(1, WireType.Varint).int32(message.player);
        /* float new_volume = 2; */
        if (message.newVolume !== 0)
            writer.tag(2, WireType.Bit32).float(message.newVolume);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message hassmic.ClientEvent.MediaPlayerVolumeChange
 */
export const ClientEvent_MediaPlayerVolumeChange = new ClientEvent_MediaPlayerVolumeChange$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ClientEvent_DeviceVolumeChange$Type extends MessageType<ClientEvent_DeviceVolumeChange> {
    constructor() {
        super("hassmic.ClientEvent.DeviceVolumeChange", [
            { no: 1, name: "new_volume", kind: "scalar", T: 2 /*ScalarType.FLOAT*/ }
        ]);
    }
    create(value?: PartialMessage<ClientEvent_DeviceVolumeChange>): ClientEvent_DeviceVolumeChange {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.newVolume = 0;
        if (value !== undefined)
            reflectionMergePartial<ClientEvent_DeviceVolumeChange>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ClientEvent_DeviceVolumeChange): ClientEvent_DeviceVolumeChange {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* float new_volume */ 1:
                    message.newVolume = reader.float();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ClientEvent_DeviceVolumeChange, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* float new_volume = 1; */
        if (message.newVolume !== 0)
            writer.tag(1, WireType.Bit32).float(message.newVolume);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message hassmic.ClientEvent.DeviceVolumeChange
 */
export const ClientEvent_DeviceVolumeChange = new ClientEvent_DeviceVolumeChange$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ClientMessage$Type extends MessageType<ClientMessage> {
    constructor() {
        super("hassmic.ClientMessage", [
            { no: 1, name: "ping", kind: "message", oneof: "msg", T: () => Ping },
            { no: 2, name: "client_info", kind: "message", oneof: "msg", T: () => ClientInfo },
            { no: 3, name: "audio_data", kind: "message", oneof: "msg", T: () => AudioData },
            { no: 4, name: "client_event", kind: "message", oneof: "msg", T: () => ClientEvent }
        ]);
    }
    create(value?: PartialMessage<ClientMessage>): ClientMessage {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.msg = { oneofKind: undefined };
        if (value !== undefined)
            reflectionMergePartial<ClientMessage>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ClientMessage): ClientMessage {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* hassmic.Ping ping */ 1:
                    message.msg = {
                        oneofKind: "ping",
                        ping: Ping.internalBinaryRead(reader, reader.uint32(), options, (message.msg as any).ping)
                    };
                    break;
                case /* hassmic.ClientInfo client_info */ 2:
                    message.msg = {
                        oneofKind: "clientInfo",
                        clientInfo: ClientInfo.internalBinaryRead(reader, reader.uint32(), options, (message.msg as any).clientInfo)
                    };
                    break;
                case /* hassmic.AudioData audio_data */ 3:
                    message.msg = {
                        oneofKind: "audioData",
                        audioData: AudioData.internalBinaryRead(reader, reader.uint32(), options, (message.msg as any).audioData)
                    };
                    break;
                case /* hassmic.ClientEvent client_event */ 4:
                    message.msg = {
                        oneofKind: "clientEvent",
                        clientEvent: ClientEvent.internalBinaryRead(reader, reader.uint32(), options, (message.msg as any).clientEvent)
                    };
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ClientMessage, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* hassmic.Ping ping = 1; */
        if (message.msg.oneofKind === "ping")
            Ping.internalBinaryWrite(message.msg.ping, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* hassmic.ClientInfo client_info = 2; */
        if (message.msg.oneofKind === "clientInfo")
            ClientInfo.internalBinaryWrite(message.msg.clientInfo, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* hassmic.AudioData audio_data = 3; */
        if (message.msg.oneofKind === "audioData")
            AudioData.internalBinaryWrite(message.msg.audioData, writer.tag(3, WireType.LengthDelimited).fork(), options).join();
        /* hassmic.ClientEvent client_event = 4; */
        if (message.msg.oneofKind === "clientEvent")
            ClientEvent.internalBinaryWrite(message.msg.clientEvent, writer.tag(4, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message hassmic.ClientMessage
 */
export const ClientMessage = new ClientMessage$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PlayAudio$Type extends MessageType<PlayAudio> {
    constructor() {
        super("hassmic.PlayAudio", [
            { no: 1, name: "announce", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 2, name: "url", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<PlayAudio>): PlayAudio {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.announce = false;
        message.url = "";
        if (value !== undefined)
            reflectionMergePartial<PlayAudio>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PlayAudio): PlayAudio {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bool announce */ 1:
                    message.announce = reader.bool();
                    break;
                case /* string url */ 2:
                    message.url = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: PlayAudio, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bool announce = 1; */
        if (message.announce !== false)
            writer.tag(1, WireType.Varint).bool(message.announce);
        /* string url = 2; */
        if (message.url !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.url);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message hassmic.PlayAudio
 */
export const PlayAudio = new PlayAudio$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ServerMessage$Type extends MessageType<ServerMessage> {
    constructor() {
        super("hassmic.ServerMessage", [
            { no: 1, name: "play_audio", kind: "message", oneof: "msg", T: () => PlayAudio },
            { no: 2, name: "set_mic_mute", kind: "scalar", oneof: "msg", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value?: PartialMessage<ServerMessage>): ServerMessage {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.msg = { oneofKind: undefined };
        if (value !== undefined)
            reflectionMergePartial<ServerMessage>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ServerMessage): ServerMessage {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* hassmic.PlayAudio play_audio */ 1:
                    message.msg = {
                        oneofKind: "playAudio",
                        playAudio: PlayAudio.internalBinaryRead(reader, reader.uint32(), options, (message.msg as any).playAudio)
                    };
                    break;
                case /* bool set_mic_mute */ 2:
                    message.msg = {
                        oneofKind: "setMicMute",
                        setMicMute: reader.bool()
                    };
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ServerMessage, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* hassmic.PlayAudio play_audio = 1; */
        if (message.msg.oneofKind === "playAudio")
            PlayAudio.internalBinaryWrite(message.msg.playAudio, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* bool set_mic_mute = 2; */
        if (message.msg.oneofKind === "setMicMute")
            writer.tag(2, WireType.Varint).bool(message.msg.setMicMute);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message hassmic.ServerMessage
 */
export const ServerMessage = new ServerMessage$Type();
