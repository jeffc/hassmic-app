import TcpSocket from "react-native-tcp-socket";

type CallbackType<T> = ((s: T) => void) | null;

// "Cheyenne" protocol server
class CheyenneServer {
  // Keep track of the socket
  sock: TcpSocket.Socket | null = null;

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

  // The server object
  server = TcpSocket.createServer((socket) => {
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
    } else {
      console.info("Already have a socket, dropping new connection");
      socket.destroy();
    }
  }).listen({ port: 11700, host: "0.0.0.0" });
}

export const CheyenneSocket: CheyenneServer = new CheyenneServer();
