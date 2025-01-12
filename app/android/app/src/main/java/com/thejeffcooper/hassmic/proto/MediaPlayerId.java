// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: hassmic.proto

package com.thejeffcooper.hassmic.proto;

/**
 *
 *
 * <pre>
 * The different media players available
 * </pre>
 *
 * Protobuf enum {@code hassmic.MediaPlayerId}
 */
public enum MediaPlayerId implements com.google.protobuf.Internal.EnumLite {
  /** <code>ID_UNKNOWN = 0;</code> */
  ID_UNKNOWN(0),
  /**
   *
   *
   * <pre>
   * The normal music/audio playback player
   * </pre>
   *
   * <code>ID_PLAYBACK = 1;</code>
   */
  ID_PLAYBACK(1),
  /**
   *
   *
   * <pre>
   * The announce player
   * </pre>
   *
   * <code>ID_ANNOUNCE = 2;</code>
   */
  ID_ANNOUNCE(2),
  UNRECOGNIZED(-1),
  ;

  /** <code>ID_UNKNOWN = 0;</code> */
  public static final int ID_UNKNOWN_VALUE = 0;

  /**
   *
   *
   * <pre>
   * The normal music/audio playback player
   * </pre>
   *
   * <code>ID_PLAYBACK = 1;</code>
   */
  public static final int ID_PLAYBACK_VALUE = 1;

  /**
   *
   *
   * <pre>
   * The announce player
   * </pre>
   *
   * <code>ID_ANNOUNCE = 2;</code>
   */
  public static final int ID_ANNOUNCE_VALUE = 2;

  @java.lang.Override
  public final int getNumber() {
    if (this == UNRECOGNIZED) {
      throw new java.lang.IllegalArgumentException(
          "Can't get the number of an unknown enum value.");
    }
    return value;
  }

  /**
   * @param value The number of the enum to look for.
   * @return The enum associated with the given number.
   * @deprecated Use {@link #forNumber(int)} instead.
   */
  @java.lang.Deprecated
  public static MediaPlayerId valueOf(int value) {
    return forNumber(value);
  }

  public static MediaPlayerId forNumber(int value) {
    switch (value) {
      case 0:
        return ID_UNKNOWN;
      case 1:
        return ID_PLAYBACK;
      case 2:
        return ID_ANNOUNCE;
      default:
        return null;
    }
  }

  public static com.google.protobuf.Internal.EnumLiteMap<MediaPlayerId> internalGetValueMap() {
    return internalValueMap;
  }

  private static final com.google.protobuf.Internal.EnumLiteMap<MediaPlayerId> internalValueMap =
      new com.google.protobuf.Internal.EnumLiteMap<MediaPlayerId>() {
        @java.lang.Override
        public MediaPlayerId findValueByNumber(int number) {
          return MediaPlayerId.forNumber(number);
        }
      };

  public static com.google.protobuf.Internal.EnumVerifier internalGetVerifier() {
    return MediaPlayerIdVerifier.INSTANCE;
  }

  private static final class MediaPlayerIdVerifier
      implements com.google.protobuf.Internal.EnumVerifier {
    static final com.google.protobuf.Internal.EnumVerifier INSTANCE = new MediaPlayerIdVerifier();

    @java.lang.Override
    public boolean isInRange(int number) {
      return MediaPlayerId.forNumber(number) != null;
    }
  }
  ;

  private final int value;

  private MediaPlayerId(int value) {
    this.value = value;
  }

  // @@protoc_insertion_point(enum_scope:hassmic.MediaPlayerId)
}
