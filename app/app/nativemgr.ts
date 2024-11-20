// Handles and abstracts away interactions with native java code

import { NativeModules, NativeEventEmitter } from "react-native";
const { BackgroundTaskModule } = NativeModules;
import { CLIENT_EVENT_KEY } from "./constants";
import { ClientEvent, ClientMessage, ServerMessage } from "./proto/hassmic";

class NativeManager_ {
  constructor() {
    // run async init
    this.initialize_().then(() => {});
  }

  // use a promise to be able to flag when everything is initialized.
  private setReady: (() => void) | null = null;
  private ready_: Promise<void> = new Promise<void>((resolve) => {
    this.setReady = resolve;
  });

  private emitter = new NativeEventEmitter(BackgroundTaskModule);

  addClientEventListener = (f: (ev: ClientEvent) => void) => {
    this.emitter.addListener(CLIENT_EVENT_KEY, (e) => {
      console.log(`Proto-valued event: ${e}`);
      try {
        let b64 = e.toString().trim();
        let bts = Buffer.from(b64, "base64");
        let ce = ClientEvent.fromBinary(bts);
        f(ce);
      } catch (e) {
        console.error(`Error in ClientEvent Listener: ${e}`);
      }
    });
  };

  private initialize_ = async () => {
    console.info("Native manager is ready.");
    this.setReady();
  };

  waitForReady = async () => {
    return this.ready_;
  };

  // Process a message that needs to be handled by native code
  handleServerMessage(sm: ServerMessage) {
    let smb64: string = Buffer.from(ServerMessage.toBinary(sm)).toString(
      "base64"
    );
    BackgroundTaskModule.handleServerMessage(smb64);
  }

  // kill any existing instance of the task
  killService = () => {
    try {
      BackgroundTaskModule.stopService();
    } catch (e) {}
  };

  // start the task
  runService = () => {
    BackgroundTaskModule.startService();
  };
}

export const NativeManager: NativeManager_ = new NativeManager_();
