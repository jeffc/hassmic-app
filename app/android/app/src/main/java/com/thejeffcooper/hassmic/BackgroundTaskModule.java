package com.thejeffcooper.hassmic;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.util.Base64;
import android.util.Log;
import androidx.core.content.ContextCompat;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.protobuf.InvalidProtocolBufferException;
import com.thejeffcooper.hassmic.proto.*;

public class BackgroundTaskModule extends ReactContextBaseJavaModule {

  private static ReactApplicationContext reactContext;

  public static final String KEY_FIRE_JS_EVENT = "HassMicFireJSEvent";
  public static final String KEY_JS_EVENT_NAME = "HassMicJSEventName";
  public static final String KEY_JS_EVENT_DATA = "HassMicJSEventData";
  public static final String KEY_JS_PROTO_VALUED_EVENT = "HassMic.ProtoValuedEvent";
  public static final String KEY_JS_EVENT_PROTO = "HassMicJSEventProto";

  BackgroundTaskModule(ReactApplicationContext context) {
    super(context);
    reactContext = context;

    BroadcastReceiver jsEventRec =
        new BroadcastReceiver() {
          @Override
          public void onReceive(Context context, Intent intent) {
            byte[] protodata = intent.getByteArrayExtra(KEY_JS_EVENT_PROTO);
            if (protodata == null || protodata.length == 0) {
              Log.e(
                  "HassmicBackgroundTaskModule",
                  "Was asked to send a JS event, but didn't get proto data");
              return;
            }
            try {
              Log.d(
                  "HassmicBackgroundTaskModule",
                  "Sending event JS event " + ClientEvent.parseFrom(protodata).getEventCase());
              reactContext
                  .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                  .emit(
                      KEY_JS_PROTO_VALUED_EVENT, Base64.encodeToString(protodata, Base64.NO_WRAP));
            } catch (InvalidProtocolBufferException e) {
              Log.e("HassmicBackgroundTaskModule", "Failed to send JS event: bad proto");
            }
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
  public void handleServerMessage(String servermessageBase64) {
    byte[] smbytes = Base64.decode(servermessageBase64, Base64.DEFAULT);
    Log.d("HassmicBackgroundTaskModule", "Handling server message");
    Intent protoIntent =
        new Intent(BackgroundTaskService.PROTO_SERVERMESSAGE_ACTION)
            .putExtra(BackgroundTaskService.KEY_PROTO_DATA, smbytes);
    this.reactContext.sendBroadcast(protoIntent);
  }

  public static void FireJSEvent(Context ctx, ClientEvent ev) {
    Log.d("HassmicBackgroundTaskModule", "Firing JS Event");
    Intent fireJSEvent = new Intent(KEY_FIRE_JS_EVENT);
    fireJSEvent.putExtra(KEY_JS_EVENT_PROTO, ev.toByteArray());
    ctx.sendBroadcast(fireJSEvent);
  }
}
