import { Button, PermissionsAndroid, Text, View } from "react-native";
import { CheyenneSocket } from "./cheyenne";
import { HASS_URL, HASS_KEY } from "./secrets";
import { Buffer } from "buffer";
import { useState, useEffect } from "react";
import { NetworkInfo } from "react-native-network-info";
import VIForegroundService from "@voximplant/react-native-foreground-service";
import { NativeModules } from "react-native";

//const { AutostartService } = NativeModules;

// note - patched version from
// https://github.com/Romick2005/react-native-live-audio-stream
import LiveAudioStream from "react-native-live-audio-stream";

export default function Index() {
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  //const [hassConnected, setHassConnected] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [sttResult, setSTTResult] = useState("");
  const [assistResult, setAssistResult] = useState("");
  const [localIP, setLocalIP] = useState<string | null>("");

  // check permissions silently
  const checkPermissions = async () => {
    const ok = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    setHasAudioPermission(ok);
    return ok;
  };

  // ask for permissions, if need
  const requestPermission = async () => {
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    setHasAudioPermission(res == PermissionsAndroid.RESULTS.GRANTED);
    console.log(res);
  };

  const setupForegroundService = async () => {
    const fgServiceChannelConfig = {
      id: "foregroundServiceChannel",
      name: "Foreground Service",
      description:
        "Necessary for running a persistent task when the app is closed",
      enableVibration: false,
    };
    await VIForegroundService.getInstance().createNotificationChannel(
      fgServiceChannelConfig
    );
    const notificationConfig = {
      channelId: fgServiceChannelConfig.id,
      id: 3456,
      title: "HassMic",
      text: "HassMic is Running",
      icon: "ic_icon",
      button: "this does nothing",
    };
    try {
      console.log("starting fg service");
      await VIForegroundService.getInstance().startService(notificationConfig);
      console.log("started fg service");
    } catch (e) {
      console.error(e);
    }
  };

  const startStream = async () => {
    LiveAudioStream.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: "", // to make tsc happy; this isn't used anywhere
    });
    LiveAudioStream.on("data", (data) => {
      const chunk = Buffer.from(data, "base64");
      CheyenneSocket.streamAudio(chunk);
    });
    LiveAudioStream.start();
    setMicOn(true);
  };

  const stopStream = async () => {
    LiveAudioStream.stop();
    setMicOn(false);
  };

  useEffect(() => {
    CheyenneSocket.setConnectionStateCallback(setIsConnected);
    checkPermissions().then((ok) => {
      if (ok) {
        startStream();
      }
    });
    NetworkInfo.getIPV4Address().then(setLocalIP);
    setupForegroundService().then(() =>
      console.log("Foreground service set up")
    );
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <>
        {hasAudioPermission ? null : (
          <Button title="Get Permissions" onPress={requestPermission} />
        )}
        <Button
          title={micOn ? "Stop Mic" : "Start Mic"}
          onPress={micOn ? stopStream : startStream}
        />
        <Text>Local IP: {localIP}</Text>
        <Text>Connected: {isConnected ? "yes" : "no"}</Text>
      </>
    </View>
  );
}
