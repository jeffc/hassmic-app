import TcpSocket from "react-native-tcp-socket";
import { APP_VERSION } from "./constants";
import { Buffer } from "buffer";
import { NativeManager } from "./nativemgr";
import { HMLogger, UUIDManager } from "./util";

import {
  AudioData,
  ClientInfo,
  ClientEvent,
  ClientMessage,
  MediaPlayerId,
  Ping,
  ServerMessage,
} from "./proto/hassmic";

type CallbackType<T> = ((s: T) => void) | null;

// "Cheyenne" protocol server
class CheyenneServer {
  // Keep track of the socket
  private _sock: TcpSocket.Socket | null = null;

  // also track the server object
  private _server: TcpSocket.Server | null = null;

  // the UUID for this device
  private _uuid: string = "";

  // settable callback for connection state
  private _connectionStateCallback: CallbackType<boolean> = null;

  // Whether the mic should be muted
  private _mic_muted: boolean = false;

  setConnectionStateCallback = (cb: CallbackType<boolean>) => {
    this._connectionStateCallback = cb;
  };

  private _setConnectionState = (s: boolean) => {
    this._connectionStateCallback?.(s);
  };

  constructor() {
    NativeManager.addClientEventListener((ce: ClientEvent) => {
      let cm = ClientMessage.create({
        msg: {
          oneofKind: "clientEvent",
          clientEvent: ce,
        },
      });
      HMLogger.debug(`Client message: ${ClientMessage.toJsonString(cm)}`);
      CheyenneSocket.sendMessage(cm);
    });
  }

  streamAudio = (streamData: Uint8Array) => {
    if (this._sock && !this._mic_muted) {
      try {
        this.sendMessage(
          ClientMessage.create({
            msg: {
              oneofKind: "audioData",
              audioData: {
                data: streamData,
              },
            },
          })
        );
      } catch (e) {
        HMLogger.info(e);
      }
    }
  };

  sendMessage = (m: ClientMessage) => {
    if (this._sock) {
      try {
        let msg = ClientMessage.toBinary(m);
        let b64 = Buffer.from(msg).toString("base64");
        this._sock.write(b64 + "\n");
      } catch (e) {
        HMLogger.error(e);
      }
    }
  };

  sendInfo = (uuid: string) => {
    this.sendMessage(
      ClientMessage.create({
        msg: {
          oneofKind: "clientInfo",
          clientInfo: {
            uuid: uuid,
            version: APP_VERSION,
          },
        },
      })
    );
    this.sendMessage(
      ClientMessage.create({
        msg: {
          oneofKind: "savedSettings",
          savedSettings: NativeManager.getSavedSettings(),
        },
      })
    );
  };

  // sends a ping every 10 seconds while the socket is open.
  startPing = () => {
    return (async () => {
      while (this._sock) {
        try {
          this.sendMessage(
            ClientMessage.create({
              msg: {
                oneofKind: "ping",
                ping: {},
              },
            })
          );
        } catch (e) {
          HMLogger.info(e);
        }
        await new Promise((resolve) => setTimeout(resolve, 10 * 1e3));
      }
      HMLogger.debug("done ping");
    })().then(() => {});
  };

  startServer = async () => {
    this._uuid = await UUIDManager.getUUID();

    this._server = TcpSocket.createServer((socket) => {
      socket.on("error", (err) => {
        HMLogger.info(`Socket error: ${err}`);
      });

      socket.on("close", (err) => {
        HMLogger.info(`Closed connection`);
        if (this._sock == socket) {
          this._sock = null;
        }
        this._setConnectionState(false);
      });

      socket.on("timeout", () => {
        HMLogger.info("Socket timed out");
        socket.destroy();
        this._setConnectionState(false);
      });

      socket.on("data", (d) => {
        this._handleIncomingData(d);
      });

      HMLogger.info(`Got connection`);
      if (this._sock == null) {
        this._sock = socket;
        socket.setTimeout(60e3);
        this._setConnectionState(true);
        this.sendInfo(this._uuid);
        this.startPing();
        HMLogger.info("All set up -- waiting");
      } else {
        HMLogger.warn("Already have a socket, dropping new connection");
        socket.destroy();
      }
    }).listen({ port: 11700, host: "0.0.0.0" });
  };

  stopServer = async () => {
    HMLogger.info("stopping server...");
    const p = new Promise<void>((resolve) => {
      this._server?.close(() => resolve());
    });
    this._sock?.destroy();
    await p;
    HMLogger.info("Server stopped");
  };

  private _handleIncomingData = async (d: Uint8Array) => {
    try {
      let b64 = d.toString().trim();
      let bts = Buffer.from(b64, "base64");
      let m = ServerMessage.fromBinary(bts);

      switch (m.msg.oneofKind) {
        case "setMicMute":
          HMLogger.info("Got set_mic_mute message");
          const shouldMute: boolean = m.msg.setMicMute;
          HMLogger.info(`Setting mic mute to ${shouldMute}`);
          this._mic_muted = shouldMute;
          break;
        // Actions that need to be handled by native code
        case "playAudio":
        case "setPlayerVolume":
        case "command":
          HMLogger.debug(
            `Got "${m.msg.oneofKind}" ServerMessage; passing it to native code`
          );
          NativeManager.handleServerMessage(m);
          break;
        default:
          HMLogger.warning(`Got unknown message type '${m.msg.oneofKind}'`);
      }
    } catch (e) {
      HMLogger.error(e);
    }
  };
}

export const CheyenneSocket: CheyenneServer = new CheyenneServer();
