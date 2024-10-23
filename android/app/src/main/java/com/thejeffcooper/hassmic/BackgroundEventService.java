package com.thejeffcooper.hassmic;

import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Nullable;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class BackgroundEventService extends HeadlessJsTaskService {

  @Nullable
  @Override
  protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    Bundle extras = intent.getExtras();

    // Configure headless JS task
    return new HeadlessJsTaskConfig(
        "HassmicBackgroundTask",
        extras != null ? Arguments.fromBundle(extras) : Arguments.createMap(),
        0, // timeout for the task
        true // allow task in foreground
        );
  }
}
