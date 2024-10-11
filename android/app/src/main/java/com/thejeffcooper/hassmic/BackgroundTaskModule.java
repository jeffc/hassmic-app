package com.thejeffcooper.hassmic;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

public class BackgroundTaskModule extends ReactContextBaseJavaModule {

  private static ReactApplicationContext reactContext;

  public static final String KEY_FIRE_JS_EVENT = "HassMicFireJSEvent";
  public static final String KEY_JS_EVENT_NAME = "HassMicJSEventName";


  BackgroundTaskModule(ReactApplicationContext context) {
    super(context);
    reactContext = context;

    BroadcastReceiver jsEventRec = new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        String eventName = intent.getStringExtra(KEY_JS_EVENT_NAME);
        if (eventName == null || eventName.equals("")) {
          Log.e("HassmicBackgroundTaskModule", "Was asked to send a JS event, but didn't get an event name");
          return;
        }
        Log.d("HassmicBackgroundTaskModule", "Sending event JS event " + eventName);
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit(eventName, null);
      }
    };

    reactContext.registerReceiver(jsEventRec, new IntentFilter(KEY_FIRE_JS_EVENT));
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

  public static void FireJSEvent(Context ctx, String eventName) {
    Log.d("HassmicBackgroundTaskModule", "Firing JS Event: " + eventName);
    Intent fireJSEvent = new Intent(KEY_FIRE_JS_EVENT);
    fireJSEvent.putExtra(KEY_JS_EVENT_NAME, eventName);
    ctx.sendBroadcast(fireJSEvent);
  }
}
