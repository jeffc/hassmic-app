import { AppRegistry, Platform } from "react-native";
import registerRootComponent from "expo/build/launch/registerRootComponent";
import Index from "./app/main";
import { name as appName } from "./app.json";
import { BackgroundTaskManager } from "./app/backgroundtask";

import TextEncoder from "react-native-fast-encoder";

// ---- begin textencoder polyfills ----
// from https://gist.github.com/aretrace/bcb0777c2cfd2b0b1d9dcfb805fe2838
if (Platform.OS !== "web") {
  const setupPolyfills = async () => {
    const { polyfillGlobal } = await import(
      "react-native/Libraries/Utilities/PolyfillFunctions"
    );
    const { ReadableStream, TransformStream } = await import(
      "web-streams-polyfill/dist/ponyfill"
    );
    const { TextEncoderStream, TextDecoderStream } = await import(
      "@stardazed/streams-text-encoding"
    );
    const { fetch, Headers, Request, Response } = await import(
      "react-native-fetch-api"
    );

    polyfillGlobal("TextDecoder", () => TextEncoder);
    polyfillGlobal("ReadableStream", () => ReadableStream);
    polyfillGlobal("TransformStream", () => TransformStream);
    polyfillGlobal("TextEncoderStream", () => TextEncoderStream);
    polyfillGlobal("TextDecoderStream", () => TextDecoderStream);
    polyfillGlobal(
      "fetch",
      () =>
        (...args) =>
          fetch(args[0], { ...args[1], reactNative: { textStreaming: true } })
    );
    polyfillGlobal("Headers", () => Headers);
    polyfillGlobal("Request", () => Request);
    polyfillGlobal("Response", () => Response);
  };

  setupPolyfills();
}

// ---- end textencoder polyfills ----

AppRegistry.registerHeadlessTask(
  "HassmicBackgroundTask",
  () => BackgroundTaskManager.run_fn
);
registerRootComponent(Index);
