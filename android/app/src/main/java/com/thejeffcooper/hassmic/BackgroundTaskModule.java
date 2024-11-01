package com.thejeffcooper.hassmic;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.util.Log;
import androidx.core.content.ContextCompat;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class BackgroundTaskModule extends ReactContextBaseJavaModule {

  private static ReactApplicationContext reactContext;

  public static final String KEY_FIRE_JS_EVENT = "HassMicFireJSEvent";
  public static final String KEY_JS_EVENT_NAME = "HassMicJSEventName";
  public static final String KEY_JS_EVENT_DATA = "HassMicJSEventData";

  BackgroundTaskModule(ReactApplicationContext context) {
    super(context);
    reactContext = context;

    BroadcastReceiver jsEventRec =
        new BroadcastReceiver() {
          @Override
          public void onReceive(Context context, Intent intent) {
            String eventName = intent.getStringExtra(KEY_JS_EVENT_NAME);
            if (eventName == null || eventName.equals("")) {
              Log.e(
                  "HassmicBackgroundTaskModule",
                  "Was asked to send a JS event, but didn't get an event name");
              return;
            }
            Log.d("HassmicBackgroundTaskModule", "Sending event JS event " + eventName);
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, null);
          }
        };

    ContextCompat.registerReceiver(
        reactContext,
        jsEventRec,
        new IntentFilter(KEY_FIRE_JS_EVENT),
        ContextCompat.RECEIVER_NOT_EXPORTED);
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
  public void playAudio(String url, boolean announce) {
    Log.d("HassmicBackgroundTaskModule", "Sending play media intent: " + url);
    Intent playIntent =
        new Intent(BackgroundTaskService.PLAY_AUDIO_ACTION)
            .putExtra(BackgroundTaskService.URL_KEY, url)
            .putExtra(BackgroundTaskService.ANNOUNCE_KEY, announce);
    Log.d("HassmicBackgroundTaskModule", playIntent.toString());
    this.reactContext.sendBroadcast(playIntent);
  }

  public static void FireJSEvent(Context ctx, String eventName, String dataJson) {
    Log.d("HassmicBackgroundTaskModule", "Firing JS Event: " + eventName + ", " + dataJson);
    Intent fireJSEvent = new Intent(KEY_FIRE_JS_EVENT);
    fireJSEvent.putExtra(KEY_JS_EVENT_NAME, eventName);
    ctx.sendBroadcast(fireJSEvent);
  }
}
