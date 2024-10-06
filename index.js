import { AppRegistry } from "react-native";
import registerRootComponent from "expo/build/launch/registerRootComponent";
import Index from "./app/main";
import { name as appName } from "./app.json";
AppRegistry.registerHeadlessTask("HassmicBackgroundTask", () =>
  require("./app/backgroundtask")
);
registerRootComponent(Index);
