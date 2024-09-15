import TcpSocket from "react-native-tcp-socket";

// "Cheyenne" protocol server
class CheyenneServer {
  // Keep track of the socket
  sock: TcpSocket.Socket | null = null;

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
    });

    socket.on("timeout", () => {
      console.info("Socket timed out");
      socket.destroy();
    });

    console.info(`Got connection`);
    if (this.sock == null) {
      this.sock = socket;
      socket.setTimeout(60e3);
    } else {
      console.info("Already have a socket, dropping new connection");
      socket.destroy();
    }
  }).listen({ port: 11700, host: "0.0.0.0" });
}

export const CheyenneSocket: CheyenneServer = new CheyenneServer();
