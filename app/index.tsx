import { Button, PermissionsAndroid, Text, View } from "react-native";

import { HassSocket } from "./hass";

import { HASS_URL, HASS_KEY } from "./secrets";

import { useState } from "react";

import MicStream from "react-native-microphone-stream";

export default function Index() {
  const requestPermission = async () => {
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    console.log(res);
  };

  const [micOn, setMicOn] = useState(false);
  const [level, setLevel] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const listener = MicStream.addListener((data) => {
    //setLevel(data.map((e) => Math.abs(e)).reduce((a, b) => Math.max(a, b), 0));
  });

  MicStream.init({
    bufferSize: 4096,
    sampleRate: 16000,
    bitsPerChannel: 16,
    channelsPerFrame: 1,
  });

  const startStream = async () => {
    MicStream.start();
    setMicOn(true);
  };

  const stopStream = async () => {
    MicStream.stop();
    setMicOn(false);
  };

  HassSocket.addStateChangeCallback((msg) => {
    console.info(msg);
  });

  const hassAuth = () => {
    const url = HASS_URL.replace("http", "ws") + "/api/websocket";
    HassSocket.connect(url, HASS_KEY);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <>
        <Button title="Get Permissions" onPress={requestPermission} />
        <Button
          title={micOn ? "Stop" : "Start"}
          onPress={micOn ? stopStream : startStream}
        />
        <Button
          title="Hass Auth"
          onPress={() => {
            hassAuth();
          }}
        />
      </>
    </View>
  );
}
