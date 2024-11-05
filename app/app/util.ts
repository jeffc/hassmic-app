import AsyncStorage from "@react-native-async-storage/async-storage";
import Zeroconf from "react-native-zeroconf";
import uuid from "react-native-uuid";

import { STORAGE_KEY_UUID } from "./constants";

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
        console.error(`Error getting UUID: ${e}`);
        fail(e);
      }

      if (!zcuuid) {
        console.debug("No zeroconf UUID found; generating one.");
        zcuuid = uuid.v4().toString();
        console.debug(`Generated UUID ${zcuuid}`);

        try {
          await AsyncStorage.setItem(STORAGE_KEY_UUID, zcuuid);
        } catch (e) {
          console.error(`Error saving UUID: ${e}`);
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

export const UUIDManager = new AppUUIDManager_();
