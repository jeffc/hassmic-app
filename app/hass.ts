import { AutoKeyMap, KeyType } from "./util/AutoKeyMap";

export enum ConnectionState {
  UNKNOWN = 1,
  DISCONNECTED,
  NEWLY_CONNECTED,
  AWAIT_AUTH,
  AUTH_INVALID,
  READY,
}
type StateChangeCallback = (newstate: ConnectionState) => void;

interface HassServerMessage {
  type: string;
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

  // container for callbacks on state change
  private _stateCallbacks: AutoKeyMap<StateChangeCallback> =
    new AutoKeyMap<StateChangeCallback>();

  // Set the state and call any callbacks
  private setState = (newstate: ConnectionState) => {
    this._state = newstate;
    this._stateCallbacks.values.forEach((f) => f(newstate));
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
  sendObj = (msg: object) => {
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
    console.debug(m.toString());
    const message: HassServerMessage = JSON.parse(m);
    console.debug(message["type"]);
    switch (message["type"]) {
      case "auth_required":
        this.setState(ConnectionState.AWAIT_AUTH);
        // send auth
        this.sendObj({
          type: "auth",
          access_token: this._hasskey,
        });
        break;
      case "auth_invalid":
        this.setState(ConnectionState.AUTH_INVALID);
        break;
      case "auth_ok":
        this.setState(ConnectionState.READY);
        break;
    }
  };

  // connect to a new home assistant instance
  connect = (addr: string, authkey: string) => {
    this._address = addr;
    this._hasskey = authkey;

    this._socket = new WebSocket(addr);
    this.setState(ConnectionState.DISCONNECTED);
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

    this._socket.onclose = function (event) {
      console.log(`Websocket closed: ${event}`);
    };
  };
}

export const HassSocket: HomeAssistantConnection =
  new HomeAssistantConnection();
