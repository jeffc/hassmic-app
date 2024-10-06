// note - patched version from
// https://github.com/Romick2005/react-native-live-audio-stream
import LiveAudioStream from "react-native-live-audio-stream";
import { AppRegistry } from "react-native";
import { Buffer } from "buffer";
import { CheyenneSocket } from "./cheyenne";
import { PermissionsAndroid } from "react-native";
import { ZeroconfManager } from "./zeroconf";
import Log from "react-native-android-log";

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

// does this need to go somewhere outside of this component?
//AppRegistry.registerHeadlessTask(
//  "HassmicBackgroundTask",
//  () => async (taskData) => {
module.exports = async (taskData) => {
  console.log("Started background task");
  CheyenneSocket.startServer();
  console.log("Started server");
  //ZeroconfManager.StartZeroconf().then(() => {});
  await ZeroconfManager.StartZeroconf();
  //const ok = await PermissionsAndroid.check(
  //  PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
  //);
  //if (!ok) {
  //  console.log("no permission; bailing");
  //  return;
  //}
  console.log("permissions okay, starting stream");
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
  console.log("stream started");
  //setMicOn(true);
  let x = 0;
  while (true) {
    console.log(`Hi from background ${x}`);
    x++;
    await sleep(1000);
  }
};
//);
