import AsyncStorage from "@react-native-async-storage/async-storage";
import Zeroconf from "react-native-zeroconf";
import uuid from "react-native-uuid";

import { HASSMIC_PORT } from "./constants";

const STORAGE_KEY_ZEROCONF_UUID = "zeroconfuuid";

class ZeroconfManager_ {
  zeroconf = new Zeroconf();

  StartZeroconf = async () => {
    let zcuuid: string = "";
    try {
      // keep the typechecker happy
      let from_storage: string | number[] | null = await AsyncStorage.getItem(
        STORAGE_KEY_ZEROCONF_UUID
      );
      if (from_storage) {
        zcuuid = from_storage.toString();
      }
    } catch (e) {
      console.error(`Error getting UUID: ${e}`);
      return;
    }

    if (!zcuuid) {
      console.debug("No zeroconf UUID found; generating one.");
      zcuuid = uuid.v4().toString();
      console.debug(`Generated UUID ${zcuuid}`);

      try {
        await AsyncStorage.setItem(STORAGE_KEY_ZEROCONF_UUID, zcuuid);
      } catch (e) {
        console.error(`Error saving UUID: ${e}`);
        return;
      }
    }

    console.debug(`Starting Zeroconf using UUID ${zcuuid}`);
    this.zeroconf.publishService(
      "hassmic",
      "tcp",
      "local.",
      zcuuid,
      HASSMIC_PORT
    );
  };
}

export const ZeroconfManager: ZeroconfManager_ = new ZeroconfManager_();
