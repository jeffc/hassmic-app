// with credit to
// https://saurav-raj-ash.medium.com/harnessing-headless-js-in-react-native-for-continuous-location-tracking-085e4f32a892

package com.thejeffcooper.hassmic;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ServiceInfo;
import android.os.Binder;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import androidx.media3.common.AudioAttributes;
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.Player;
import androidx.media3.exoplayer.ExoPlayer;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.ReactMethod;
import com.google.protobuf.InvalidProtocolBufferException;
import com.thejeffcooper.hassmic.proto.*;

public class BackgroundTaskService extends Service {
  public static final String PROTO_SERVERMESSAGE_ACTION =
      "com.thejeffcooper.hassmic.INTENT_PROTO_SERVERMESSAGE";
  public static final String KEY_PROTO_DATA = "com.thejeffcooper.hassmic.KEY_PROTO_DATA";

  public static final String EVENT_PLAY_SOUND_START = "hassmic.SpeechStart";
  public static final String EVENT_PLAY_SOUND_STOP = "hassmic.SpeechStop";

  private static final int SERVICE_NOTIFICATION_ID = 100001;
  private static final String CHANNEL_ID = "BACKGROUND_LISTEN";

  private Handler handler = new Handler();
  private ExoPlayer audioExo;
  private ExoPlayer announceExo;

  // binder implentation from android guide to allow module to bind to this service.
  private IBinder binder = new BackgroundTaskBinder();

  public class BackgroundTaskBinder extends Binder {
    BackgroundTaskService getService() {
      // Return this instance of LocalService so clients can call public methods.
      return BackgroundTaskService.this;
    }
  }

  @Override
  public IBinder onBind(Intent intent) {
    return binder;
  }

  private Player enumToPlayer(MediaPlayerId id) {
    switch (id) {
      case ID_PLAYBACK:
        return audioExo;
      case ID_ANNOUNCE:
        return announceExo;
      default:
        Log.w("HassmicBackgroundTaskService", "Can't get player for unknown player id " + id);
        return null;
    }
  }

  @ReactMethod
  public float getVolume(MediaPlayerId id) {
    Player p = enumToPlayer(id);
    return p.getVolume();
  }

  private Runnable runnableCode =
      new Runnable() {
        @Override
        public void run() {

          Context context = getApplicationContext();

          // Start BackgroundEventService
          Intent myIntent = new Intent(context, BackgroundEventService.class);
          context.startService(myIntent);

          // Acquire wake lock
          HeadlessJsTaskService.acquireWakeLockNow(context);

          // Create the exoplayers: one for normal audio (music) and one for
          // announcements.

          // Audio exoplayer
          audioExo =
              new ExoPlayer.Builder(context)
                  .setAudioAttributes(
                      new AudioAttributes.Builder()
                          .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
                          .setUsage(C.USAGE_MEDIA)
                          .build(),
                      true)
                  .build();

          // Announcement exoplayer
          announceExo =
              new ExoPlayer.Builder(context)
                  .setAudioAttributes(
                      new AudioAttributes.Builder()
                          .setContentType(C.AUDIO_CONTENT_TYPE_SPEECH)
                          .setUsage(C.USAGE_ASSISTANT)
                          .build(),
                      false)
                  .build();

          // listen for important events and fire them back to JS
          Player.Listener audioEventListener =
              new Player.Listener() {
                @Override
                public void onEvents(Player p, Player.Events events) {
                  MediaPlayerId which_player = MediaPlayerId.ID_UNKNOWN;
                  if (p == audioExo) {
                    which_player = MediaPlayerId.ID_PLAYBACK;
                  } else if (p == announceExo) {
                    which_player = MediaPlayerId.ID_ANNOUNCE;
                  }
                  Log.d(
                      "HassmicBackgroundTaskService", "Got events for " + which_player.toString());

                  // Loop over each media player event in this tick and fire it back
                  // to JS
                  //
                  // We don't want to send duplicate messages, so keep track of
                  // the types we might need to deduplicate
                  boolean hasPlaybackStateChangedEvent = false;
                  boolean hasIsPlayingChangedEvent = false;
                  for (int i = 0; i < events.size(); i++) {
                    hasPlaybackStateChangedEvent |=
                        events.get(i) == Player.EVENT_PLAYBACK_STATE_CHANGED;
                    hasIsPlayingChangedEvent |= events.get(i) == Player.EVENT_IS_PLAYING_CHANGED;
                  }

                  for (int i = 0; i < events.size(); i++) {
                    @Player.Event int e = events.get(i);
                    ClientEvent.Builder protob = ClientEvent.newBuilder();

                    // some common info
                    @Player.Event int playbackState = p.getPlaybackState();
                    boolean isPlaying = p.isPlaying();

                    // Don't send duplicate messages:
                    //   - If we have both IS_PLAYING_CHANGED and
                    //     PLAYBACK_STATE_CHANGED events, ignore one or the
                    //     other.
                    if (hasIsPlayingChangedEvent && hasPlaybackStateChangedEvent) {
                      if ((isPlaying && e == Player.EVENT_PLAYBACK_STATE_CHANGED)
                          || (!isPlaying && e == Player.EVENT_IS_PLAYING_CHANGED)) {
                        continue;
                      }
                    }

                    switch (e) {
                      case Player.EVENT_PLAYBACK_STATE_CHANGED:
                      case Player.EVENT_IS_PLAYING_CHANGED:
                        ClientEvent.MediaPlayerStateChange.Builder b =
                            ClientEvent.MediaPlayerStateChange.newBuilder().setPlayer(which_player);

                        MediaPlayerState newState = null;

                        if (playbackState == Player.STATE_READY) {
                          newState =
                              (isPlaying)
                                  ? MediaPlayerState.STATE_PLAYING
                                  : MediaPlayerState.STATE_PAUSED;
                        } else if (playbackState == Player.STATE_BUFFERING) {
                          newState = MediaPlayerState.STATE_BUFFERING;
                        } else if (playbackState == Player.STATE_IDLE
                            || playbackState == Player.STATE_ENDED) {
                          newState = MediaPlayerState.STATE_IDLE;
                        } else {
                          Log.w(
                              "HassmicBackgroundTaskService",
                              "Unhandled playback state: " + playbackState);
                        }

                        b.setNewState(newState);
                        protob.setMediaPlayerStateChange(b.build());
                        break;

                        // note: this might fire twice (once for each player)
                      case Player.EVENT_DEVICE_VOLUME_CHANGED:
                        DeviceVolume d =
                            DeviceVolume.newBuilder().setNewVolume(p.getDeviceVolume()).build();
                        protob.setDeviceVolumeChange(d);
                        break;

                      case Player.EVENT_VOLUME_CHANGED:
                        MediaPlayerVolume mpv =
                            MediaPlayerVolume.newBuilder()
                                .setPlayer(which_player)
                                .setNewVolume(p.getVolume())
                                .build();
                        protob.setMediaPlayerVolumeChange(mpv);
                        break;
                    }

                    ClientEvent ce = protob.build();
                    Log.d("HassmicBackgroundTaskService", "Proto: " + ce.toString());
                    if (ce.getEventCase() != ClientEvent.EventCase.EVENT_NOT_SET) {
                      BackgroundTaskModule.FireJSEvent(getApplicationContext(), ce);
                    }
                  }
                }
              };
          audioExo.addListener(audioEventListener);
          announceExo.addListener(audioEventListener);
        }
      };

  @Override
  public void onCreate() {
    super.onCreate();
    IntentFilter filter = new IntentFilter(PROTO_SERVERMESSAGE_ACTION);
    ContextCompat.registerReceiver(
        getApplicationContext(), brec, filter, ContextCompat.RECEIVER_EXPORTED);
    Log.d("HassmicBackgroundTaskService", "Registered receiver for " + brec.toString());
  }

  private final BroadcastReceiver brec =
      new BroadcastReceiver() {

        @Override
        public void onReceive(Context context, Intent intent) {
          Log.d("HassmicBackgroundTaskService", "called onReceive()");
          String action = intent.getAction();
          if (!action.equals(PROTO_SERVERMESSAGE_ACTION)) {
            Log.w(
                "HassmicBackgroundTaskService",
                "Got action type " + action + ", which isn't " + PROTO_SERVERMESSAGE_ACTION);
            return;
          }

          ServerMessage sm = null;
          byte[] protodata = intent.getByteArrayExtra(KEY_PROTO_DATA);

          Log.d("HassmicBackgroundTaskService", "Parsing proto from intent");
          try {
            sm = ServerMessage.parseFrom(protodata);
          } catch (InvalidProtocolBufferException e) {
            Log.e("HassmicBackgroundTaskService", "Failed to parse protobuf");
            return;
          }
          Log.d("HassmicBackgroundTaskService", "Proto parsed ok");

          BackgroundTaskService.this.handleServerMessage(sm);
        }
      };

  public void handleServerMessage(ServerMessage sm) {
    switch (sm.getMsgCase()) {
      case PLAY_AUDIO:
        {
          PlayAudio pa = sm.getPlayAudio();
          boolean announce = pa.getAnnounce();
          String url = pa.getUrl();

          Log.d(
              "HassmicBackgroundTaskService",
              "Playing " + url + " (announce = " + String.valueOf(announce) + ")");
          MediaItem i = MediaItem.fromUri(url);

          if (announce) {
            // if we're announcing, pause the audioExo if it's playing
            if (audioExo.isPlaying()) {
              Log.d("HassmicBackgroundTaskService", "Playing announcement. Pausing playing audio");
              audioExo.pause();
              announceExo.addListener(
                  new Player.Listener() {
                    @Override
                    public void onPlaybackStateChanged(@Player.State int newState) {
                      if (newState == Player.STATE_ENDED) {
                        Log.d(
                            "HassmicBackgroundTaskService",
                            "Finished playing announcement. Resuming audio");
                        audioExo.play();
                        announceExo.removeListener(this);
                      }
                    }
                  });
            }
            announceExo.setMediaItem(i);
            announceExo.prepare();
            announceExo.play();
          } else {
            audioExo.setMediaItem(i);
            audioExo.prepare();
            audioExo.play();
          }
          break;
        }
      case SET_DEVICE_VOLUME:
        // need to figure out if Player.setDeviceVolume() is actually the
        // right way to do this, or if it needs to be done a different
        // way.
        Log.w("HassmicBackgroundTaskService", "set_device_volume is not currently implemented");
        break;
      case SET_PLAYER_VOLUME:
        float newVolume = sm.getSetPlayerVolume().getNewVolume();
        Player p = enumToPlayer(sm.getSetPlayerVolume().getPlayer());
        if (p == null) {
          Log.e("HassmicBackgroundTaskService", "Can't determine player; not setting volume");
          break;
        }
        if (0.0 <= newVolume && newVolume <= 1.0) {
          // per android docs, use a log scale for volume
          float logVol = 1.0f - (float) (Math.log(101 - 100 * newVolume) / Math.log(101));
          Log.d(
              "HassmicBackgroundTaskService",
              "Setting device volume to " + newVolume + " (=>" + logVol + ")");
          p.setVolume(logVol);
        } else {
          Log.e("HassmicBackgroundTaskService", "Device volume setting invalid: " + newVolume);
        }
        break;
      case SET_MIC_MUTE:
        {
          String t = sm.getMsgCase().toString();
          Log.e(
              "HassmicBackgroundTaskService",
              "Got ServerMessage type '" + t + "' in native code, which shouldn't happen.");
          break;
        }
      case COMMAND:
        {
          Player pp = enumToPlayer(sm.getCommand().getId());
          if (pp == null) {
            Log.e("HassmicBackgroundTaskService", "Got player command but no player ID set");
            break;
          }
          MediaPlayerCommandId cmd = sm.getCommand().getCommand();

          switch (cmd) {
            case COMMAND_PLAY:
              Log.d(
                  "HassMicBackgroundService",
                  "Got play command for player " + sm.getCommand().getId().toString());
              pp.play();
              break;
            case COMMAND_PAUSE:
              Log.d(
                  "HassMicBackgroundService",
                  "Got pause command for player " + sm.getCommand().getId().toString());
              pp.pause();
              break;
            case COMMAND_STOP:
              Log.d(
                  "HassMicBackgroundService",
                  "Got stop command for player " + sm.getCommand().getId().toString());
              pp.stop();
              break;
            default:
              Log.e(
                  "HassmicBackgroundTaskService", "Got unknown player command: " + cmd.toString());
              break;
          }
        }
      default:
        Log.e(
            "HassmicBackgroundTaskService",
            "Got unknown ServerMessage type: " + sm.getMsgCase().getNumber());
    }
  }
  ;

  @Override
  public void onDestroy() {
    super.onDestroy();
    Log.d("HassmicBackgroundTaskService", "Destroying service");
    audioExo.release();
    announceExo.release();
    this.handler.removeCallbacks(this.runnableCode); // Stop runnable execution
    getApplicationContext().unregisterReceiver(brec);
    stopForeground(STOP_FOREGROUND_REMOVE);
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    Log.d("HassmicBackgroundTaskService", "Starting service");
    this.handler.post(this.runnableCode); // Start runnable execution

    // Create notification for foreground service
    Intent notificationIntent = new Intent(this, MainActivity.class);
    PendingIntent contentIntent =
        PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      createChannel();
      Notification notification =
          new NotificationCompat.Builder(this, CHANNEL_ID)
              .setContentIntent(contentIntent)
              .setTicker("HassMic Active") // Informative ticker text
              .setContentTitle("HassMic") // Your app's name
              .setContentText("HassMic is Running") // Explain what's happening
              .setSmallIcon(R.mipmap.ic_launcher)
              .setOngoing(true)
              .build();

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        startForeground(
            SERVICE_NOTIFICATION_ID,
            notification,
            ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
                | ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
      } else {
        startForeground(SERVICE_NOTIFICATION_ID, notification);
      }
    }
    return START_STICKY_COMPATIBILITY;
  }

  @RequiresApi(Build.VERSION_CODES.O)
  private void createChannel() {
    String description = "Background Notifications";
    int importance = NotificationManager.IMPORTANCE_DEFAULT;
    NotificationChannel channel =
        new NotificationChannel(CHANNEL_ID, "background_notifications", importance);
    channel.setDescription(description);
    NotificationManager notificationManager =
        (NotificationManager) getApplicationContext().getSystemService(NOTIFICATION_SERVICE);

    notificationManager.createNotificationChannel(channel);
  }
}
