import { Button, PermissionsAndroid, Text, View } from "react-native";

import { HassSocket, ConnectionState } from "./hass";

import { HASS_URL, HASS_KEY } from "./secrets";

import { Buffer } from "buffer";

import { useState, useEffect } from "react";
import { KeyType } from "./util/AutoKeyMap";

// note - patched version from
// https://github.com/Romick2005/react-native-live-audio-stream
import LiveAudioStream from "react-native-live-audio-stream";

export default function Index() {
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  const [hassConnected, setHassConnected] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [hassSocketCallbackRef, setHassSocketCallbackRef] =
    useState<KeyType | null>(null);
  const [micListener, setMicListener] = useState<(() => void) | null>(null);

  // check permissions silently
  const checkPermissions = async () => {
    const ok = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    setHasAudioPermission(ok);
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
    });
    LiveAudioStream.on("data", (data) => {
      let chunk = Buffer.from(data, "base64");
      HassSocket.streamAudio(chunk);
    });
    LiveAudioStream.start();
    setMicOn(true);
  };

  const stopStream = async () => {
    LiveAudioStream.stop();
    setMicOn(false);
  };

  const hassAuth = () => {
    const url = HASS_URL.replace("http", "ws") + "/api/websocket";
    HassSocket.connect(url, HASS_KEY);
  };

  useEffect(() => {
    checkPermissions();
    if (hassSocketCallbackRef != null) {
      HassSocket.removeStateChangeCallback(hassSocketCallbackRef);
    }
    const ref = HassSocket.addStateChangeCallback((s) => {
      const newstate = ConnectionState[s];
      console.info(newstate);
      const ic = HassSocket.isConnected();
      setHassConnected(ic);
    });
    setHassSocketCallbackRef(ref);
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
          title={micOn ? "Stop" : "Start"}
          onPress={micOn ? stopStream : startStream}
        />
        {!hassConnected ? (
          <Button
            title="Connect Home Assistant"
            onPress={() => {
              hassAuth();
            }}
          />
        ) : (
          <>
            <Button
              title="Start Assist Stream"
              onPress={() => HassSocket.startStream()}
            />
            <Button
              title="Disconnect"
              onPress={() => HassSocket.disconnect()}
            />
          </>
        )}
      </>
    </View>
  );
}
