import TcpSocket from "react-native-tcp-socket";
import * as Application from "expo-application";
import { UUIDManager } from "./util";
import { APP_VERSION } from "./constants";

type CallbackType<T> = ((s: T) => void) | null;

// "Cheyenne" protocol server
class CheyenneServer {
  // Keep track of the socket
  _sock: TcpSocket.Socket | null = null;

  // also track the server object
  _server: TcpSocket.Server | null = null;

  // the UUID for this device
  _uuid: string = "";

  // settable callback for connection state
  connectionStateCallback: CallbackType<boolean> = null;

  setConnectionStateCallback = (cb: CallbackType<boolean>) => {
    this.connectionStateCallback = cb;
  };

  _setConnectionState = (s: boolean) => {
    this.connectionStateCallback?.(s);
  };

  streamAudio = (streamData: Uint8Array) => {
    if (this._sock) {
      try {
        this._sock.write(
          JSON.stringify({
            type: "audio-chunk",
            payload_length: streamData.length,
          }) + "\n"
        );
        this._sock.write(streamData);
      } catch (e) {
        console.info(e);
      }
    }
  };

  sendInfo = (uuid: string) => {
    if (this._sock) {
      this._sock.write(
        JSON.stringify({
          type: "client-info",
          data: {
            uuid: uuid,
            app_version: APP_VERSION,
          },
        }) + "\n"
      );
    }
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
          this._sock.write(streamData);
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
      this._server?.close(resolve);
    });
    this._sock?.destroy();
    await p;
    console.log("Server stopped");
  };
}

export const CheyenneSocket: CheyenneServer = new CheyenneServer();
