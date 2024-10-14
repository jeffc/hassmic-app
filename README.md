# HassMic (The App)

This is the HassMic app, an Android application designed to run on devices
acting as Home Assistant voice assistant satellites.

It is meant to pair with the [HassMic
Integration](http://github.com/jeffc/hassmic-integration).

[**Latest commit APK**](https://nightly.link/jeffc/hassmic-app/workflows/build-apk-dev/dev/app-latest.apk.zip) (no guarantee of functionality)

It is currently in active development and probably has lots of bugs. Some
highlights:

-   Automatically starting on Android 12+ fails in an annoying way: the service
    auto-starts, but can't access the microphone. This is a security feature
    added to Android that I don't have a great solution for (no auto-start
    services can access the microphone unless they also start a UI).
-   There's not really a "UI" to speak of. Opening the app gives some diagnostic
    information and a single toggle switch. You **must** enable running in the
    background, since that's where all the work happens. If running in the
    background isn't enabled, the app does nothing.

## License

[![CC BY-SA 4.0][cc-by-sa-shield]][cc-by-sa]

This work is licensed under a
[Creative Commons Attribution-ShareAlike 4.0 International License][cc-by-sa].

[![CC BY-SA 4.0][cc-by-sa-image]][cc-by-sa]

[cc-by-sa]: http://creativecommons.org/licenses/by-sa/4.0/
[cc-by-sa-image]: https://licensebuttons.net/l/by-sa/4.0/88x31.png
[cc-by-sa-shield]: https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg

## Dev Tips

This project is built on React-Native. To run a dev build, connect to an
android device or emulator and run:

```
npx expo run:android
```

To build an APK for release,

```
cd android
./gradlew assembleRelease
```

The built APK will be at `android/app/build/outputs/apk/release/app-release.apk`
