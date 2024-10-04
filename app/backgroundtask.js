import { AppRegistry } from "react-native";
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

// does this need to go somewhere outside of this component?
AppRegistry.registerHeadlessTask(
  "HassmicBackgroundTask",
  () => async (taskData) => {
    let x = 0;
    while (true) {
      console.log(`Hi from background ${x}`);
      x++;
      await sleep(1000);
    }
  }
);
