import Zeroconf from "react-native-zeroconf";

import { HASSMIC_PORT, STORAGE_KEY_UUID } from "./constants";
import { HMLogger, UUIDManager } from "./util";

class ZeroconfManager_ {
  zeroconf = new Zeroconf();

  StartZeroconf = async () => {
    let zcuuid: string = await UUIDManager.getUUID();

    HMLogger.debug(`Starting Zeroconf using UUID ${zcuuid}`);
    this.zeroconf.publishService(
      "hassmic",
      "tcp",
      "local.",
      zcuuid,
      HASSMIC_PORT
    );
  };

  StopZeroconf = async () => {
    let zcuuid: string = await UUIDManager.getUUID();

    HMLogger.debug(`Stopping Zeroconf using UUID ${zcuuid}`);
    this.zeroconf.unpublishService(zcuuid);
  };
}

export const ZeroconfManager: ZeroconfManager_ = new ZeroconfManager_();
