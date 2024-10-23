import TcpSocket from "react-native-tcp-socket";
import * as Application from "expo-application";
import { UUIDManager } from "./util";
import { APP_VERSION } from "./constants";

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
        // build the JSON packet and the stream data into a single Uint8Array
        // so that they send atomically
        const pkt = new TextEncoder().encode(
          JSON.stringify({
            type: "audio-chunk",
            payload_length: streamData.length,
          }) + "\n"
        );
        let combinedArray = new Uint8Array(pkt.length + streamData.length);
        combinedArray.set(pkt);
        combinedArray.set(streamData, pkt.length);
        this._sock.write(combinedArray);
      } catch (e) {
        console.info(e);
      }
    }
  };

  sendMessage = (type: string, data: object | undefined) => {
    if (this._sock) {
      this._sock.write(
        JSON.stringify({
          type: type,
          data: data,
        }) + "\n"
      );
    }
  };

  sendInfo = (uuid: string) => {
    this.sendMessage("client-info", {
      uuid: uuid,
      app_version: APP_VERSION,
    });
  };

  // sends a ping every 10 seconds while the socket is open.
  startPing = () => {
    return (async () => {
      while (this._sock) {
        try {
          this._sock.write(
            JSON.stringify({
              type: "ping",
            }) + "\n"
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
        this._handleIncomingData(d.toString());
      });

      console.info(`Got connection`);
      if (this._sock == null) {
        this._sock = socket;
        socket.setTimeout(60e3);
        this._setConnectionState(true);
        this.sendInfo(this._uuid);
        this.startPing();
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

  private _handleIncomingData = async (d: string) => {
    try {
      let m = JSON.parse(d.toString());

      switch (m["type"]) {
        case "play-announce":
          {
            console.info("Got play-announce message");
            const data = m["data"] || {};
            const url = data["url"] || "";
            if (url) {
              console.log(`Playing URL '${url}'`);
              this._playAudioCallback?.(url, true);
            } else {
              console.warn("message.data.url is not set");
            }
          }
          break;
        case "play-audio":
          {
            console.info("Got play-audio message");
            const data = m["data"] || {};
            const url = data["url"] || "";
            if (url) {
              console.log(`Playing URL '${url}'`);
              this._playAudioCallback?.(url, false);
            } else {
              console.warn("message.data.url is not set");
            }
          }
          break;

        default:
          console.warn(`Got unknown message type '${m["type"]}'`);
      }
    } catch (e) {
      console.error(e);
    }
  };
}

export const CheyenneSocket: CheyenneServer = new CheyenneServer();
