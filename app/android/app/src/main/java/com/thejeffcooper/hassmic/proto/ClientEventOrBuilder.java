// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: hassmic.proto

package com.thejeffcooper.hassmic.proto;

public interface ClientEventOrBuilder
    extends
    // @@protoc_insertion_point(interface_extends:hassmic.ClientEvent)
    com.google.protobuf.MessageLiteOrBuilder {

  /**
   * <code>.hassmic.ClientEvent.MediaPlayerStateChange media_player_state_change = 1;</code>
   *
   * @return Whether the mediaPlayerStateChange field is set.
   */
  boolean hasMediaPlayerStateChange();

  /**
   * <code>.hassmic.ClientEvent.MediaPlayerStateChange media_player_state_change = 1;</code>
   *
   * @return The mediaPlayerStateChange.
   */
  com.thejeffcooper.hassmic.proto.ClientEvent.MediaPlayerStateChange getMediaPlayerStateChange();

  /**
   * <code>.hassmic.MediaPlayerVolume media_player_volume_change = 2;</code>
   *
   * @return Whether the mediaPlayerVolumeChange field is set.
   */
  boolean hasMediaPlayerVolumeChange();

  /**
   * <code>.hassmic.MediaPlayerVolume media_player_volume_change = 2;</code>
   *
   * @return The mediaPlayerVolumeChange.
   */
  com.thejeffcooper.hassmic.proto.MediaPlayerVolume getMediaPlayerVolumeChange();

  /**
   * <code>.hassmic.DeviceVolume device_volume_change = 3;</code>
   *
   * @return Whether the deviceVolumeChange field is set.
   */
  boolean hasDeviceVolumeChange();

  /**
   * <code>.hassmic.DeviceVolume device_volume_change = 3;</code>
   *
   * @return The deviceVolumeChange.
   */
  com.thejeffcooper.hassmic.proto.DeviceVolume getDeviceVolumeChange();

  /**
   * <code>.hassmic.Log log = 4;</code>
   *
   * @return Whether the log field is set.
   */
  boolean hasLog();

  /**
   * <code>.hassmic.Log log = 4;</code>
   *
   * @return The log.
   */
  com.thejeffcooper.hassmic.proto.Log getLog();

  public com.thejeffcooper.hassmic.proto.ClientEvent.EventCase getEventCase();
}
