import TcpSocket from "react-native-tcp-socket";
import * as Application from "expo-application";
import { UUIDManager } from "./util";
import { APP_VERSION } from "./constants";

type CallbackType<T> = ((s: T) => void) | null;

// "Cheyenne" protocol server
class CheyenneServer {
  // Keep track of the socket
  sock: TcpSocket.Socket | null = null;

  _uuid: str | null = null;

  // settable callback for connection state
  connectionStateCallback: CallbackType<boolean> = null;

  setConnectionStateCallback = (cb: CallbackType<boolean>) => {
    this.connectionStateCallback = cb;
  };

  _setConnectionState = (s: boolean) => {
    this.connectionStateCallback?.(s);
  };

  streamAudio = (streamData: Uint8Array) => {
    if (this.sock) {
      try {
        this.sock.write(
          JSON.stringify({
            type: "audio-chunk",
            payload_length: streamData.length,
          }) + "\n"
        );
        this.sock.write(streamData);
      } catch (e) {
        console.info(e);
      }
    }
  };

  sendInfo = (uuid: str) => {
    this.sock.write(
      JSON.stringify({
        type: "client-info",
        data: {
          uuid: uuid,
          app_version: APP_VERSION,
        },
      }) + "\n"
    );
  };

  startServer = async () => {
    this._uuid = await UUIDManager.getUUID();

    this._server = TcpSocket.createServer((socket) => {
      socket.on("error", (err) => {
        console.info(`Socket error: ${err}`);
      });

      socket.on("close", (err) => {
        console.info(`Closed connection`);
        if (this.sock == socket) {
          this.sock = null;
        }
        this._setConnectionState(false);
      });

      socket.on("timeout", () => {
        console.info("Socket timed out");
        socket.destroy();
        this._setConnectionState(false);
      });

      console.info(`Got connection`);
      if (this.sock == null) {
        this.sock = socket;
        socket.setTimeout(60e3);
        this._setConnectionState(true);
        this.sendInfo(this._uuid);
      } else {
        console.info("Already have a socket, dropping new connection");
        socket.destroy();
      }
    }).listen({ port: 11700, host: "0.0.0.0" });
  };
}

export const CheyenneSocket: CheyenneServer = new CheyenneServer();
