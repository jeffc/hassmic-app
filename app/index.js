import { AppRegistry } from "react-native";
import registerRootComponent from "expo/build/launch/registerRootComponent";
import Index from "./app/main";
import { name as appName } from "./app.json";
import { BackgroundTaskManager } from "./app/backgroundtask";
AppRegistry.registerHeadlessTask(
  "HassmicBackgroundTask",
  () => BackgroundTaskManager.run_fn
);
registerRootComponent(Index);
