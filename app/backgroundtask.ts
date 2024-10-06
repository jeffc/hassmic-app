import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppRegistry } from "react-native";
import { Buffer } from "buffer";
import { CheyenneSocket } from "./cheyenne";
import { NativeModules } from "react-native";
import { PermissionsAndroid } from "react-native";
import { STORAGE_KEY_RUN_BACKGROUND_TASK } from "./constants";
import { ZeroconfManager } from "./zeroconf";

const { BackgroundTaskModule } = NativeModules;

// note - patched version from
// https://github.com/Romick2005/react-native-live-audio-stream
import LiveAudioStream from "react-native-live-audio-stream";

const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

// Convenience type for a generic callback
type CallbackType<T> = (s: T) => void;

export enum TaskState {
  // no info
  UNKNOWN,

  // task tried to start but failed
  FAILED,

  // task is running
  RUNNING,

  // task is not running (on purpose)
  STOPPED,
}

class BackgroundTaskManager_ {
  // track the task state
  private taskState: TaskState = TaskState.UNKNOWN;

  // convenience function: sets the state and calls the callback
  private setState = (s: TaskState) => {
    this.taskState = s;
    this.taskStateCallback(s);
  };

  // callback for when the task state changes
  private taskStateCallback: CallbackType<TaskState> = (s: TaskState) => {};

  // callback setter
  // calls callback immediately with current state when set
  setTaskStateCallback = (f: CallbackType<TaskState> | null) => {
    if (f) {
      this.taskStateCallback = f;
    } else {
      this.taskStateCallback = (s: TaskState) => {};
    }
  };

  // track enable state
  private isEnabled: Promise<boolean> = new Promise<boolean>(
    (resolve, fail) => {
      (async () => {
        let en_str: string = "";
        try {
          // keep the typechecker happy
          let from_storage: string | number[] | null =
            await AsyncStorage.getItem(STORAGE_KEY_RUN_BACKGROUND_TASK);
          if (from_storage) {
            en_str = from_storage?.toString();
          }
        } catch (e) {
          console.error(`Error getting task enable state: ${e}`);
          fail(e);
        }

        let en: boolean = en_str === "true";
        if (!en_str) {
          console.log("No enable state found. Setting to false.");
          en = false;
        }

        resolve(en);
      })();
    }
  );

  // callback for when the enable state is changed or set
  private enableStateCallback: CallbackType<boolean> = (b: boolean) => {};

  // callback setter
  // once enable state is known, calls callback
  setEnableStateCallback = (f: CallbackType<boolean> | null) => {
    if (f) {
      this.enableStateCallback = f;
    } else {
      this.enableStateCallback = (s: boolean) => {};
    }

    this.isEnabled.then(this.enableStateCallback);
  };

  // enable or disable the task
  setEnabled = (enable: boolean) => {
    (async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY_RUN_BACKGROUND_TASK,
          enable ? "true" : "false"
        );
      } catch (e) {
        console.error(`Error saving enable state: ${e}`);
      }
      this.isEnabled = new Promise<boolean>((resolve) => resolve(enable));
      this.enableStateCallback(enable);
    })().then(() => {});
  };

  // actually run the task
  run_fn = async (taskData: any) => {
    if (this.taskState == TaskState.RUNNING) {
      console.error("Background task is already running; not starting again!");
      return;
    }

    const shouldRun = await this.isEnabled;

    if (!shouldRun) {
      console.log("Not running background task; is disabled");
      this.setState(TaskState.STOPPED);
      return;
    }

    console.log("Started background task");
    const shouldStop = new Promise<void>((resolve) => {
      this.stop_fn = resolve;
    });

    CheyenneSocket.startServer();
    console.log("Started server");
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
    this.setState(TaskState.RUNNING);

    console.log("Background task running, awaiting stop signal");
    await shouldStop;
    console.log("Background task got stop signal, stopping");
    LiveAudioStream.stop();
    CheyenneSocket.stopServer();
  };

  // stop_fun is set by run() to the resolver on a promise. run() then runs
  // until that promise is fulfilled.
  private stop_fn: (() => void) | null = null;

  // stop the current run by resolving the promise using stop_fn.
  stop = () => {
    if (this.stop_fn) {
      this.stop_fn();
      this.setState(TaskState.STOPPED);
    } else {
      console.error(
        "Called stop() on background task, but it doesn't appear to be running"
      );
    }
  };

  // start the task
  run = () => {
    BackgroundTaskModule.startService();
  };
}

export const BackgroundTaskManager = new BackgroundTaskManager_();
