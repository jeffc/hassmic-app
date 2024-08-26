import { AutoKeyMap, KeyType } from "./util/AutoKeyMap";

export enum ConnectionState {
  UNKNOWN = 1,
  DISCONNECTED,
  NEWLY_CONNECTED,
  AWAIT_AUTH,
  AUTH_INVALID,
  READY,
  ASSIST_START,
  STREAMING,
  PROCESSING,
}
type StateChangeCallback = (newstate: ConnectionState) => void;

interface HassServerMessage {
  type: string;
  id?: number;
  event?: { [Key: string]: any };
}

class HomeAssistantConnection {
  // server address
  private _address?: string;

  // home assistant auth key
  private _hasskey?: string;

  // communication socket
  private _socket?: WebSocket;

  // current state of this connection
  private _state: ConnectionState = ConnectionState.UNKNOWN;

  // home assistant uses message IDs to keep track of transactions
  // message ID must increase monotonically.
  private _nextMessageId: number = 100;
  private _currentTransactionId?: number;

  // ID for streaming audio
  private _bin_id?: number;

  // container for callbacks on state change
  private _stateCallbacks: AutoKeyMap<StateChangeCallback> =
    new AutoKeyMap<StateChangeCallback>();

  // Set the state and call any callbacks
  private setState = (newstate: ConnectionState) => {
    this._state = newstate;
    this._stateCallbacks.values.forEach((f) => f(newstate));
  };

  // Getter for state
  getState = () => this._state;

  // convenience function
  isConnected = () => {
    switch (this._state) {
      case ConnectionState.READY:
        return true;
      case ConnectionState.STREAMING:
        return true;
      case ConnectionState.ASSIST_START:
        return true;
      case ConnectionState.PROCESSING:
        return true;
      default:
        return false;
    }
  };

  // Add a callback for when the state changes
  addStateChangeCallback = (cb: StateChangeCallback): KeyType => {
    return this._stateCallbacks.add(cb);
  };

  // Remove a callback for when the state changes
  removeStateChangeCallback = (key: KeyType) => {
    this._stateCallbacks.remove(key);
  };

  // send structured data to home assistant
  sendObj = (msg: { [Key: string]: any }, addID: boolean = true) => {
    if (addID) {
      msg["id"] = this._nextMessageId;
      this._currentTransactionId = this._nextMessageId;
      this._nextMessageId++;
    }
    const m: string = JSON.stringify(msg);
    console.info("sending: " + m);
    if (!this._socket) {
      console.error("Socket is null or undefined");
      return;
    }
    this._socket.send(m);
  };

  // handle messages from the server
  handleMessage = (m: string) => {
    const message: HassServerMessage = JSON.parse(m);
    console.debug(m.toString());
    switch (message["type"]) {
      case "auth_required":
        this.setState(ConnectionState.AWAIT_AUTH);
        // send auth
        this.sendObj(
          {
            type: "auth",
            access_token: this._hasskey,
          },
          false
        );
        break;
      case "auth_invalid":
        this.setState(ConnectionState.AUTH_INVALID);
        break;
      case "auth_ok":
        this.setState(ConnectionState.READY);
        break;
      case "event":
        if (message["id"] == this._currentTransactionId) {
          this.handleEvent(message);
        } else {
          console.error(
            `Current transaction ID is ${this._currentTransactionId}, but got ID ${message["id"]} from server`
          );
        }
        break;
    }
  };

  handleEvent = (ev: HassServerMessage) => {
    const e = ev.event;
    if (!e) {
      console.error("Event message had no body");
      return;
    }
    const d = e["data"];
    switch (e["type"]) {
      case "run-start":
        const binary_id = d["runner_data"]["stt_binary_handler_id"];
        console.log(`Starting pipeline run with bin ID ${binary_id}`);
        this._bin_id = binary_id;
        break;
      case "wake_word-start":
        console.log("Listening for wakeword");
        this.setState(ConnectionState.STREAMING);
        break;
      case "stt-start":
        console.log("STT Phase start");
        break;
      case "stt-vad-start":
        console.log("Transcribing...");
        break;
      case "stt-vad-end":
        console.log("Processing");
        this.setState(ConnectionState.PROCESSING);
        break;
      case "stt-end":
        console.log(`Got STT: "${d["stt_output"]["text"]}"`);
        break;
      case "tts-start":
        console.log(`Got TTS: "${d["tts_input"]}"`);
        break;
      case "tts-end":
        console.log(`Got TTS URL: "${d["url"]}"`);
        this.setState(ConnectionState.READY);
        break;
      case "error":
        console.error(`Got Error: (${d["code"]}): "${d["message"]}"`);
        this.setState(ConnectionState.READY);
        break;
      default:
        console.log(`Got event type ${e["type"]}; not explicitly handling it`);
    }
  };

  private _DEBUGSOCK?: WebSocket;

  streamAudio = (streamData: Uint8Array) => {
    if (this._state == ConnectionState.STREAMING) {
      if (this._bin_id === undefined) {
        console.error("can't stream; bin_id is not set");
        return;
      }
      if (!this._socket) {
        console.error("can't stream; socket is undefined");
        return;
      }
      const ar = Uint8Array.of(this._bin_id, ...streamData);
      this._socket.send(ar);
    }
  };

  disconnect = () => {
    if (this._socket) {
      this._socket.close();
    }
  };

  // connect to a new home assistant instance
  connect = (addr: string, authkey: string) => {
    this._address = addr;
    this._hasskey = authkey;

    this._socket = new WebSocket(addr);
    this.setState(ConnectionState.DISCONNECTED);
    this._DEBUGSOCK = new WebSocket("ws://192.168.1.201:7777");
    const _hassobj = this;

    this._socket.onopen = function (event) {
      console.log(`Websocket opened: ${event}`);
      _hassobj.setState(ConnectionState.NEWLY_CONNECTED);
    };

    this._socket.onmessage = (m: MessageEvent) =>
      this.handleMessage(m.data.toString());

    this._socket.onerror = function (event) {
      console.error(event);
    };

    this._socket.onclose = () => this.setState(ConnectionState.DISCONNECTED);
  };

  // start a stream
  startStream = () => {
    this._currentTransactionId = undefined;
    this.sendObj({
      type: "assist_pipeline/run",
      start_stage: "wake_word",
      end_stage: "tts",
      input: {
        sample_rate: 16000,
      },
    });
  };
}

export const HassSocket: HomeAssistantConnection =
  new HomeAssistantConnection();
