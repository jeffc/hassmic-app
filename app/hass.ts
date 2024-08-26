import { AutoKeyMap, KeyType } from "./util/AutoKeyMap";

export enum ConnectionState {
  UNKNOWN = 1,
  DISCONNECTED,
  NEWLY_CONNECTED,
  AWAIT_AUTH,
  AUTH_INVALID,
  READY,
  ASSIST_START,
  STREAMING_WAKEWORD,
  STREAMING_STT,
  PROCESSING,
}
type ChangeCallback<T> = (x: T) => void;

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

  //// container for callbacks on state change
  //private _stateCallbacks: AutoKeyMap<ChangeCallback<ConnectionState>> =
  //  new AutoKeyMap<ChangeCallback<ConnectionState>>();

  // callbacks
  private _stateCallback?: ChangeCallback<ConnectionState>;
  private _newSTTCallback?: ChangeCallback<string>;
  private _newResultCallback?: ChangeCallback<string>;

  // Set the state and call any callbacks
  private setState = (newstate: ConnectionState) => {
    this._state = newstate;
    //this._stateCallbacks.values.forEach((f) => f(newstate));
    this._stateCallback?.(newstate);
  };

  // Getter for state
  getState = () => this._state;

  // convenience function
  isConnected = () => {
    switch (this._state) {
      case ConnectionState.ASSIST_START:
      case ConnectionState.PROCESSING:
      case ConnectionState.READY:
      case ConnectionState.STREAMING_STT:
      case ConnectionState.STREAMING_WAKEWORD:
        return true;
      default:
        return false;
    }
  };

  // convenience function
  isStreaming = () => {
    switch (this._state) {
      case ConnectionState.STREAMING_STT:
      case ConnectionState.STREAMING_WAKEWORD:
        return true;
      default:
        return false;
    }
  };

  //// Add a callback for when the state changes
  //addChangeCallback<ConnectionState> = (cb: ChangeCallback<ConnectionState>): KeyType => {
  //  return this._stateCallbacks.add(cb);
  //};

  // callback setters
  onStateChange = (cb?: ChangeCallback<ConnectionState>) =>
    (this._stateCallback = cb);
  onSTTParsed = (cb?: ChangeCallback<string>) => (this._newSTTCallback = cb);
  onAssistResult = (cb?: ChangeCallback<string>) =>
    (this._newResultCallback = cb);

  //// Remove a callback for when the state changes
  //removeChangeCallback<ConnectionState> = (key: KeyType) => {
  //  this._stateCallbacks.remove(key);
  //};

  // storage for the last TTS and STT
  private _recognizedSpeech: string = "";
  private _responseText: string = "";

  getSTTResult = () => this._recognizedSpeech;
  getAssistResult = () => this._responseText;

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
        this._bin_id = d["runner_data"]["stt_binary_handler_id"];
        console.log(`Starting pipeline run with bin ID ${this._bin_id}`);
        break;
      case "wake_word-start":
        console.log("Listening for wakeword");
        this.setState(ConnectionState.STREAMING_WAKEWORD);
        break;
      case "stt-start":
        console.log("STT Phase start");
        this.setState(ConnectionState.STREAMING_STT);
        break;
      case "stt-vad-start":
        console.log("Transcribing...");
        break;
      case "stt-vad-end":
        console.log("Processing");
        this.setState(ConnectionState.PROCESSING);
        break;
      case "stt-end":
        this._recognizedSpeech = d["stt_output"]["text"];
        console.log(`Got STT: "${this._recognizedSpeech}"`);
        this._newSTTCallback?.(this._recognizedSpeech);
        break;
      case "tts-start":
        this._responseText = d["tts_input"];
        console.log(`Got TTS: "${this._responseText}"`);
        this._newResultCallback?.(this._responseText);
        break;
      case "tts-end":
        console.log(`Got TTS URL: "${d["tts_output"]["url"]}"`);
        break;
      case "run-end":
        console.log(`Run end. starting again...`);
        this.setState(ConnectionState.READY);
        this.startAssist();
        break;
      case "error":
        console.error(`Got Error: (${d["code"]}): "${d["message"]}"`);
        this.setState(ConnectionState.READY);
        this._responseText = "";
        this._recognizedSpeech = "";
        this._newSTTCallback("");
        this._newResultCallback("");
        break;
      default:
        console.log(`Got event type ${e["type"]}; not explicitly handling it`);
    }
  };

  streamAudio = (streamData: Uint8Array) => {
    if (this.isStreaming()) {
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

    this._socket.onopen = () => this.setState(ConnectionState.NEWLY_CONNECTED);

    this._socket.onmessage = (m: MessageEvent) =>
      this.handleMessage(m.data.toString());

    this._socket.onerror = function (event) {
      console.error(event);
    };

    this._socket.onclose = () => this.setState(ConnectionState.DISCONNECTED);
  };

  // kick off the assist pipeline
  startAssist = () => {
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
