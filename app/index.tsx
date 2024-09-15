import { Button, PermissionsAndroid, Text, View } from "react-native";

import { CheyenneSocket } from "./cheyenne";

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
  const [sttResult, setSTTResult] = useState("");
  const [assistResult, setAssistResult] = useState("");
  //const [hassState, setHassState] = useState(ConnectionState.UNKNOWN);

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

  const hassAuth = () => {
    const url = HASS_URL.replace("http", "ws") + "/api/websocket";
    //HassSocket.connect(url, HASS_KEY);
  };

  useEffect(() => {
    checkPermissions();
    //HassSocket.onStateChange((s) => {
    //  setHassState(s);
    //  const newstate = ConnectionState[s];
    //  console.info(newstate);
    //  const ic = HassSocket.isConnected();
    //  setHassConnected(ic);
    //});
    //HassSocket.onSTTParsed(setSTTResult);
    //HassSocket.onAssistResult(setAssistResult);
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
        {/*
        <Text>Home assistant state: {ConnectionState[hassState]}</Text>
        {sttResult ? (
          <>
            <Text>Latest STT: {sttResult}</Text>
            <Text>Latest Answer: {assistResult}</Text>
          </>
        ) : null}
        {hasAudioPermission ? null : (
          <Button title="Get Permissions" onPress={requestPermission} />
        )}
        <Button
          title={micOn ? "Stop Microphone" : "Start Microphone"}
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
              title="Start Assist Pipeline"
              onPress={() => HassSocket.startAssist()}
            />
            <Button
              title="Disconnect"
              onPress={() => HassSocket.disconnect()}
            />
          </>
        )}
        */}
      </>
    </View>
  );
}
