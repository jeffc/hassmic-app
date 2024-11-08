import TcpSocket from "react-native-tcp-socket";
import { Buffer } from "buffer";
import * as Application from "expo-application";
import { UUIDManager } from "./util";
import { APP_VERSION } from "./constants";

import {
  AudioData,
  ClientInfo,
  ClientMessage,
  Ping,
  ServerMessage,
} from "./proto/hassmic";

type CallbackType<T> = ((s: T) => void) | null;
type PlayAudioCallbackType = ((url: string, announce: boolean) => void) | null;

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

  setConnectionStateCallback = (cb: CallbackType<boolean>) => {
    this._connectionStateCallback = cb;
  };

  private _setConnectionState = (s: boolean) => {
    this._connectionStateCallback?.(s);
  };

  // callback to play audio via URL
  private _playAudioCallback: PlayAudioCallbackType = null;

  setPlayAudioCallback = (cb: PlayAudioCallbackType) => {
    this._playAudioCallback = cb;
  };

  streamAudio = (streamData: Uint8Array) => {
    if (this._sock) {
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
        console.info(e);
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
        console.error(e);
        console.error(e.stack);
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
          console.info(e);
        }
        await new Promise((resolve) => setTimeout(resolve, 10 * 1e3));
      }
      console.log("done ping");
    })().then(() => {});
  };

  startServer = async () => {
    this._uuid = await UUIDManager.getUUID();

    this._server = TcpSocket.createServer((socket) => {
      socket.on("error", (err) => {
        console.info(`Socket error: ${err}`);
      });

      socket.on("close", (err) => {
        console.info(`Closed connection`);
        if (this._sock == socket) {
          this._sock = null;
        }
        this._setConnectionState(false);
      });

      socket.on("timeout", () => {
        console.info("Socket timed out");
        socket.destroy();
        this._setConnectionState(false);
      });

      socket.on("data", (d) => {
        this._handleIncomingData(d);
      });

      console.info(`Got connection`);
      if (this._sock == null) {
        this._sock = socket;
        socket.setTimeout(60e3);
        this._setConnectionState(true);
        this.sendInfo(this._uuid);
        this.startPing();
        console.info("All set up -- waiting");
      } else {
        console.info("Already have a socket, dropping new connection");
        socket.destroy();
      }
    }).listen({ port: 11700, host: "0.0.0.0" });
  };

  stopServer = async () => {
    console.log("stopping server...");
    const p = new Promise<void>((resolve) => {
      this._server?.close(() => resolve());
    });
    this._sock?.destroy();
    await p;
    console.log("Server stopped");
  };

  private _handleIncomingData = async (d: Uint8Array) => {
    try {
      console.info(`Got raw: ${d}`);
      let b64 = d.toString().trim();
      console.info(`Got trimmed: ${b64}`);
      let bts = Buffer.from(b64, "base64");
      console.info(`Got parsed: ${bts}`);
      let m = ServerMessage.fromBinary(bts);

      switch (m.msg.oneofKind) {
        case "playAudio":
          {
            console.info("Got play_audio message");
            const data = m.msg.playAudio || {};
            const url = data.url || "";
            const announce = data.announce || false;
            if (url) {
              console.log(`Playing URL '${url}' (announce=${announce})`);
              this._playAudioCallback?.(url, announce);
            } else {
              console.warn("audio_data.url is not set");
            }
          }
          break;
        default:
          console.warn(`Got unknown message type '${d.msg.oneofKind}'`);
      }
    } catch (e) {
      console.error(e);
    }
  };
}

export const CheyenneSocket: CheyenneServer = new CheyenneServer();
