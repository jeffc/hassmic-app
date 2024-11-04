The files that go in this directory are **generated** and should not be checked
in directly.

They are regenerated as part of the android release process (`cd android;
./gradlew assembleRelease`).

To regenerate manually, go to the main project directory and run

```
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=app/ ./proto/*.proto
```
