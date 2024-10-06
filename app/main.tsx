import { Button, PermissionsAndroid, Text, View } from "react-native";
import { CheyenneSocket } from "./cheyenne";
import { HASS_URL, HASS_KEY } from "./secrets";
import { Buffer } from "buffer";
import { useState, useEffect } from "react";
import { NetworkInfo } from "react-native-network-info";
import { NativeModules } from "react-native";
import { ZeroconfManager } from "./zeroconf";

//import { BackgroundTask } from "./backgroundtask";

const { BackgroundTaskModule } = NativeModules;

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
    //checkPermissions().then((ok) => {
    //	if (ok) {
    //		startStream();
    //	}
    //});
    NetworkInfo.getIPV4Address().then(setLocalIP);
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
        <Button
          title="BackgroundTask"
          onPress={() => BackgroundTaskModule.startService()}
        />
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
