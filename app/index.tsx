import {
  Button,
  PermissionsAndroid,
  Text,
  View,
} from "react-native";

import { useState } from "react";

import MicStream from "react-native-microphone-stream";


export default function Index() {
  let requestPermission = async () => {
    let res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    console.log(res);
  };

  const [micOn, setMicOn] = useState(false);

  const listener = MicStream.addListener(data => {});
  MicStream.init({
    bufferSize: 4096,
    sampleRate: 44100,
    bitsPerChannel: 16,
    channelsPerFrame: 1,
  });

  let startStream = async () => {
    MicStream.start();
    setMicOn(true);
  };

  let stopStream = async() => {
    MicStream.stop();
    setMicOn(false);
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
        <Text>Edit app/index.tsx to edit this screen.</Text>
        <Button 
          title="Get Permissions"
          onPress={requestPermission}
        />
        <Button 
          title={ micOn ? "Stop" : "Start" }
          onPress={() => { micOn ? stopStream() : startStream(); }}
        />
      </>
    </View>
  );
}
