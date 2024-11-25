# HassMic

Hassmic is an Android application and [Home
Assistant](https://home-assistant.io) designed to run on devices acting as Home
Assistant voice assistant satellites.

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

This project is built on React Native and uses a substantial amount of native
code. Vestiges of expo infrastructure still exist, but expo commands won't work.

To build an APK use,

```
cd android
./gradlew assembleRelease
```

The built APK will be at `android/app/build/outputs/apk/release/app-release.apk`

You can also use `installRelease` instead of `assembleRelease` to install the
built package to a device connected via adb.

## Protocol Notes

The HassMic client and server communicate using a slightly strange paradigm
based on protocol buffers (defined in the `proto/` directory). The server sends
`ServerMessage` messages to the client, and the client sends `ClientMessage`s
to the server. Because of a strange bug that I never quite got to the bottom of
with sending raw binary data back and forth, these protos are marshalled to
their binary forms and then base64-encoded, and sent over the wire as
newline-separated strings. There is no handshaking involved; client messages and
server messages are handled by separate threads on both ends. The client also
sends a periodic `ping` to let the server know it's still connected, even if
it's not sending audio data.

The protocol name `Cheyenne` is an outdated pun -- in early versions of Hassmic,
the protocol was based around the core of the Wyoming protocol. It has since
been rewritten and no longer resembles Wyoming, but for the moment the name
persists.
