import AsyncStorage from "@react-native-async-storage/async-storage";
import Zeroconf from "react-native-zeroconf";
import uuid from "react-native-uuid";

import { STORAGE_KEY_UUID } from "./constants";
import { CheyenneSocket } from "./cheyenne";
import { ClientMessage, Log, Log_Severity } from "./proto/hassmic";

// Manages the app UUID in storage and sets it if it isn't set
class AppUUIDManager_ {
  // adapted from https://www.jonmellman.com/posts/singleton-promises
  private _uuid_setup_promise = new Promise<string>((resolve, fail) => {
    (async () => {
      let zcuuid: string = "";
      try {
        // keep the typechecker happy
        let from_storage: string | number[] | null =
          await AsyncStorage.getItem(STORAGE_KEY_UUID);
        if (from_storage) {
          zcuuid = from_storage.toString();
        }
      } catch (e) {
        new HMLogger().error(`Error getting UUID: ${e}`);
        fail(e);
      }

      if (!zcuuid) {
        new HMLogger().debug("No zeroconf UUID found; generating one.");
        zcuuid = uuid.v4().toString();
        new HMLogger().debug(`Generated UUID ${zcuuid}`);

        try {
          await AsyncStorage.setItem(STORAGE_KEY_UUID, zcuuid);
        } catch (e) {
          new HMLogger().error(`Error saving UUID: ${e}`);
          return;
        }
      }
      resolve(zcuuid);
    })();
  });

  getUUID = async (): Promise<string> => {
    return await this._uuid_setup_promise;
  };
}

// wrapper around log features
class HMLogger_ {
  private log_ = (severity: Log_Severity, msg: string) => {
    let m = ClientMessage.create({
      msg: {
        oneofKind: "clientEvent",
        clientEvent: {
          event: {
            oneofKind: "log",
            log: {
              severity: severity,
              logText: msg,
            },
          },
        },
      },
    });
    CheyenneSocket.sendMessage(m);
  };

  debug = (msg: string) => {
    console.debug("[HM] " + msg);
    this.log_(Log_Severity.DEBUG, msg);
  };

  info = (msg: string) => {
    console.info("[HM] " + msg);
    this.log_(Log_Severity.INFO, msg);
  };

  warning = (msg: string) => {
    console.warn("[HM] " + msg);
    this.log_(Log_Severity.WARNING, msg);
  };

  warn = this.warning;

  error = (msg: string) => {
    console.error("[HM] " + msg);
    this.log_(Log_Severity.ERROR, msg);
  };
}

export const UUIDManager = new AppUUIDManager_();
export const HMLogger = new HMLogger_();
