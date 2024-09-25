import Zeroconf from "react-native-zeroconf";

import { HASSMIC_PORT, STORAGE_KEY_UUID } from "./constants";
import { UUIDManager } from "./util";

class ZeroconfManager_ {
  zeroconf = new Zeroconf();

  StartZeroconf = async () => {
    let zcuuid: string = await UUIDManager.getUUID();

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
