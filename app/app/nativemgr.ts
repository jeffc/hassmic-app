// Handles and abstracts away interactions with native java code

import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, NativeEventEmitter } from "react-native";
const { BackgroundTaskModule } = NativeModules;
import { Buffer } from "buffer";
import {
  CLIENT_EVENT_KEY,
  STORAGE_KEY_SAVED_SETTINGS_PROTO,
} from "./constants";

import {
  ClientEvent,
  ClientMessage,
  MediaPlayerId,
  SavedSettings,
  ServerMessage,
} from "./proto/hassmic";

class NativeManager_ {
  emitter = new NativeEventEmitter(BackgroundTaskModule);

  // use a promise to be able to flag when everything is initialized.
  private setReady: (() => void) | null = null;
  private ready_: Promise<void> | null = null;

  constructor() {
    this.ready_ = new Promise<void>((resolve) => {
      this.setReady = resolve;
    });
    // run async init
    this.initialize_().then(
      (ok) => console.log("Init ok"),
      (nok) => console.error(`Init not ok: ${nok}`)
    );
  }

  getVolume = (p: MediaPlayerId) => {
    return this.volumeLevels.get(p);
  };

  private savedSettings_: SavedSettings = SavedSettings.create({});
  private writeSavedSettings_ = async () => {
    console.log("writing saved settings");
    await AsyncStorage.setItem(
      STORAGE_KEY_SAVED_SETTINGS_PROTO,
      Buffer.from(SavedSettings.toBinary(this.savedSettings_)).toString(
        "base64"
      )
    );
    console.log("wrote");
  };

  getSavedSettings = () => {
    // make a deep copy of the saved settings structure and return it
    let ssb64 = SavedSettings.toBinary(this.savedSettings_);
    return SavedSettings.fromBinary(ssb64);
  };

  // perform async initializiations
  private initialize_ = async () => {
    console.warn("Initializing native manager");
    console.warn("Listening");

    // get the saved settings from storage
    let ss = await AsyncStorage.getItem(STORAGE_KEY_SAVED_SETTINGS_PROTO);
    if (ss) {
      try {
        console.warn(`got storage: ${ss.toString()}`);
        let b64 = ss.toString().trim();
        let bts = Buffer.from(b64, "base64");
        this.savedSettings_ = SavedSettings.fromBinary(bts);
        console.warn("Parsed");
      } catch (e) {
        console.error(`Error loading saved settings: ${e}`);
        ss = null;
      }
    }
    if (!ss) {
      console.warn(`No saved settings found, creating defaults`);
      this.savedSettings_ = SavedSettings.create({
        announceVolume: 1.0,
        playbackVolume: 1.0,
      });
    }
    console.warn("saving...");
    console.log(SavedSettings.toJsonString(this.savedSettings_));
    await this.writeSavedSettings_();

    this.addClientEventListener(this.onClientEvent);

    console.info("Native manager is ready.");
    this.setReady();
  };

  waitForReady = async () => {
    await this.ready_;
  };

  // Add a listener for ClientEvents sent by native code.
  addClientEventListener = (f: (ev: ClientEvent) => void) => {
    this.emitter.addListener(CLIENT_EVENT_KEY, (ev) => {
      console.log(`Proto-valued event: ${ev}`);
      try {
        let b64 = ev.toString().trim();
        let bts = Buffer.from(b64, "base64");
        let ce = ClientEvent.fromBinary(bts);
        f(ce);
      } catch (e) {
        console.error(`Error in ClientEvent Listener: ${e}`);
      }
    });
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

  // What to do on ClientEvent receipt from native code
  private onClientEvent = (ce: ClientEvent) => {
    console.info(ClientEvent.toJsonString(ce));
    if (ce.event.oneofKind == "mediaPlayerVolumeChange") {
      const vl = ce.event.mediaPlayerVolumeChange;
      switch (vl.player) {
        case MediaPlayerId.ID_ANNOUNCE:
          console.log(`Setting new volume level for announce to ${vl.volume}`);
          this.savedSettings_.announceVolume = vl.volume;
          // save in the background
          this.writeSavedSettings_().then(() => {});
          break;
        case MediaPlayerId.ID_PLAYBACK:
          console.log(`Setting new volume level for playback to ${vl.volume}`);
          this.savedSettings_.playbackVolume = vl.volume;
          // save in the background
          this.writeSavedSettings_().then(() => {});
          break;
        default:
          console.error(`Unknown player in event: ${vl.player}`);
      }
    }
  };
}

export const NativeManager: NativeManager_ = new NativeManager_();
