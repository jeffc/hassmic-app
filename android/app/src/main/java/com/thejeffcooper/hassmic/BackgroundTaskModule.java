package com.thejeffcooper.hassmic;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.HashMap;
import java.util.Map;

public class BackgroundTaskModule extends ReactContextBaseJavaModule {
  private static ReactApplicationContext reactContext;
  BackgroundTaskModule(ReactApplicationContext context) {
    super(context);
    reactContext = context;
  }

  @Override
  public String getName() {
    return "BackgroundTaskModule";
  }

  @ReactMethod
  public void startService() {
    Intent serviceIntent = new Intent(this.reactContext, BackgroundTaskService.class);
    Log.d("HassmicBackgroundTaskModule", "Starting background task");

    // Start service based on Android version
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      this.reactContext.startForegroundService(serviceIntent);
    } else {
      this.reactContext.startService(serviceIntent);
    }
  }

  @ReactMethod
  public void stopService() {
    this.reactContext.stopService(new Intent(this.reactContext, BackgroundTaskService.class));
  }

  @ReactMethod
  public void playSpeech(String url) {
    Log.d("HassmicBackgroundTaskModule", "Sending play media intent: " + url);
    Intent playIntent = new Intent(BackgroundTaskService.PLAY_SPEECH_ACTION)
      .putExtra(BackgroundTaskService.URL_KEY, url);
    Log.d("HassmicBackgroundTaskModule", playIntent.toString());
    this.reactContext.sendBroadcast(playIntent);
  }
}
