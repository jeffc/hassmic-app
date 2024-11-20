// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: hassmic.proto

package com.thejeffcooper.hassmic.proto;

/**
 *
 *
 * <pre>
 * A media player has changed state
 * </pre>
 *
 * Protobuf type {@code hassmic.MediaPlayerStateChange}
 */
public final class MediaPlayerStateChange
    extends com.google.protobuf.GeneratedMessageLite<
        MediaPlayerStateChange, MediaPlayerStateChange.Builder>
    implements
    // @@protoc_insertion_point(message_implements:hassmic.MediaPlayerStateChange)
    MediaPlayerStateChangeOrBuilder {
  private MediaPlayerStateChange() {}

  public static final int PLAYER_FIELD_NUMBER = 1;
  private int player_;

  /**
   * <code>.hassmic.MediaPlayerId player = 1;</code>
   *
   * @return The enum numeric value on the wire for player.
   */
  @java.lang.Override
  public int getPlayerValue() {
    return player_;
  }

  /**
   * <code>.hassmic.MediaPlayerId player = 1;</code>
   *
   * @return The player.
   */
  @java.lang.Override
  public com.thejeffcooper.hassmic.proto.MediaPlayerId getPlayer() {
    com.thejeffcooper.hassmic.proto.MediaPlayerId result =
        com.thejeffcooper.hassmic.proto.MediaPlayerId.forNumber(player_);
    return result == null ? com.thejeffcooper.hassmic.proto.MediaPlayerId.UNRECOGNIZED : result;
  }

  /**
   * <code>.hassmic.MediaPlayerId player = 1;</code>
   *
   * @param value The enum numeric value on the wire for player to set.
   */
  private void setPlayerValue(int value) {
    player_ = value;
  }

  /**
   * <code>.hassmic.MediaPlayerId player = 1;</code>
   *
   * @param value The player to set.
   */
  private void setPlayer(com.thejeffcooper.hassmic.proto.MediaPlayerId value) {
    player_ = value.getNumber();
  }

  /** <code>.hassmic.MediaPlayerId player = 1;</code> */
  private void clearPlayer() {

    player_ = 0;
  }

  public static final int NEW_STATE_FIELD_NUMBER = 2;
  private int newState_;

  /**
   * <code>.hassmic.MediaPlayerState new_state = 2;</code>
   *
   * @return The enum numeric value on the wire for newState.
   */
  @java.lang.Override
  public int getNewStateValue() {
    return newState_;
  }

  /**
   * <code>.hassmic.MediaPlayerState new_state = 2;</code>
   *
   * @return The newState.
   */
  @java.lang.Override
  public com.thejeffcooper.hassmic.proto.MediaPlayerState getNewState() {
    com.thejeffcooper.hassmic.proto.MediaPlayerState result =
        com.thejeffcooper.hassmic.proto.MediaPlayerState.forNumber(newState_);
    return result == null ? com.thejeffcooper.hassmic.proto.MediaPlayerState.UNRECOGNIZED : result;
  }

  /**
   * <code>.hassmic.MediaPlayerState new_state = 2;</code>
   *
   * @param value The enum numeric value on the wire for newState to set.
   */
  private void setNewStateValue(int value) {
    newState_ = value;
  }

  /**
   * <code>.hassmic.MediaPlayerState new_state = 2;</code>
   *
   * @param value The newState to set.
   */
  private void setNewState(com.thejeffcooper.hassmic.proto.MediaPlayerState value) {
    newState_ = value.getNumber();
  }

  /** <code>.hassmic.MediaPlayerState new_state = 2;</code> */
  private void clearNewState() {

    newState_ = 0;
  }

  public static com.thejeffcooper.hassmic.proto.MediaPlayerStateChange parseFrom(
      java.nio.ByteBuffer data) throws com.google.protobuf.InvalidProtocolBufferException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(DEFAULT_INSTANCE, data);
  }

  public static com.thejeffcooper.hassmic.proto.MediaPlayerStateChange parseFrom(
      java.nio.ByteBuffer data, com.google.protobuf.ExtensionRegistryLite extensionRegistry)
      throws com.google.protobuf.InvalidProtocolBufferException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(
        DEFAULT_INSTANCE, data, extensionRegistry);
  }

  public static com.thejeffcooper.hassmic.proto.MediaPlayerStateChange parseFrom(
      com.google.protobuf.ByteString data)
      throws com.google.protobuf.InvalidProtocolBufferException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(DEFAULT_INSTANCE, data);
  }

  public static com.thejeffcooper.hassmic.proto.MediaPlayerStateChange parseFrom(
      com.google.protobuf.ByteString data,
      com.google.protobuf.ExtensionRegistryLite extensionRegistry)
      throws com.google.protobuf.InvalidProtocolBufferException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(
        DEFAULT_INSTANCE, data, extensionRegistry);
  }

  public static com.thejeffcooper.hassmic.proto.MediaPlayerStateChange parseFrom(byte[] data)
      throws com.google.protobuf.InvalidProtocolBufferException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(DEFAULT_INSTANCE, data);
  }

  public static com.thejeffcooper.hassmic.proto.MediaPlayerStateChange parseFrom(
      byte[] data, com.google.protobuf.ExtensionRegistryLite extensionRegistry)
      throws com.google.protobuf.InvalidProtocolBufferException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(
        DEFAULT_INSTANCE, data, extensionRegistry);
  }

  public static com.thejeffcooper.hassmic.proto.MediaPlayerStateChange parseFrom(
      java.io.InputStream input) throws java.io.IOException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(DEFAULT_INSTANCE, input);
  }

  public static com.thejeffcooper.hassmic.proto.MediaPlayerStateChange parseFrom(
      java.io.InputStream input, com.google.protobuf.ExtensionRegistryLite extensionRegistry)
      throws java.io.IOException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(
        DEFAULT_INSTANCE, input, extensionRegistry);
  }

  public static com.thejeffcooper.hassmic.proto.MediaPlayerStateChange parseDelimitedFrom(
      java.io.InputStream input) throws java.io.IOException {
    return parseDelimitedFrom(DEFAULT_INSTANCE, input);
  }

  public static com.thejeffcooper.hassmic.proto.MediaPlayerStateChange parseDelimitedFrom(
      java.io.InputStream input, com.google.protobuf.ExtensionRegistryLite extensionRegistry)
      throws java.io.IOException {
    return parseDelimitedFrom(DEFAULT_INSTANCE, input, extensionRegistry);
  }

  public static com.thejeffcooper.hassmic.proto.MediaPlayerStateChange parseFrom(
      com.google.protobuf.CodedInputStream input) throws java.io.IOException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(DEFAULT_INSTANCE, input);
  }

  public static com.thejeffcooper.hassmic.proto.MediaPlayerStateChange parseFrom(
      com.google.protobuf.CodedInputStream input,
      com.google.protobuf.ExtensionRegistryLite extensionRegistry)
      throws java.io.IOException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(
        DEFAULT_INSTANCE, input, extensionRegistry);
  }

  public static Builder newBuilder() {
    return (Builder) DEFAULT_INSTANCE.createBuilder();
  }

  public static Builder newBuilder(
      com.thejeffcooper.hassmic.proto.MediaPlayerStateChange prototype) {
    return (Builder) DEFAULT_INSTANCE.createBuilder(prototype);
  }

  /**
   *
   *
   * <pre>
   * A media player has changed state
   * </pre>
   *
   * Protobuf type {@code hassmic.MediaPlayerStateChange}
   */
  public static final class Builder
      extends com.google.protobuf.GeneratedMessageLite.Builder<
          com.thejeffcooper.hassmic.proto.MediaPlayerStateChange, Builder>
      implements
      // @@protoc_insertion_point(builder_implements:hassmic.MediaPlayerStateChange)
      com.thejeffcooper.hassmic.proto.MediaPlayerStateChangeOrBuilder {
    // Construct using com.thejeffcooper.hassmic.proto.MediaPlayerStateChange.newBuilder()
    private Builder() {
      super(DEFAULT_INSTANCE);
    }

    /**
     * <code>.hassmic.MediaPlayerId player = 1;</code>
     *
     * @return The enum numeric value on the wire for player.
     */
    @java.lang.Override
    public int getPlayerValue() {
      return instance.getPlayerValue();
    }

    /**
     * <code>.hassmic.MediaPlayerId player = 1;</code>
     *
     * @param value The player to set.
     * @return This builder for chaining.
     */
    public Builder setPlayerValue(int value) {
      copyOnWrite();
      instance.setPlayerValue(value);
      return this;
    }

    /**
     * <code>.hassmic.MediaPlayerId player = 1;</code>
     *
     * @return The player.
     */
    @java.lang.Override
    public com.thejeffcooper.hassmic.proto.MediaPlayerId getPlayer() {
      return instance.getPlayer();
    }

    /**
     * <code>.hassmic.MediaPlayerId player = 1;</code>
     *
     * @param value The enum numeric value on the wire for player to set.
     * @return This builder for chaining.
     */
    public Builder setPlayer(com.thejeffcooper.hassmic.proto.MediaPlayerId value) {
      copyOnWrite();
      instance.setPlayer(value);
      return this;
    }

    /**
     * <code>.hassmic.MediaPlayerId player = 1;</code>
     *
     * @return This builder for chaining.
     */
    public Builder clearPlayer() {
      copyOnWrite();
      instance.clearPlayer();
      return this;
    }

    /**
     * <code>.hassmic.MediaPlayerState new_state = 2;</code>
     *
     * @return The enum numeric value on the wire for newState.
     */
    @java.lang.Override
    public int getNewStateValue() {
      return instance.getNewStateValue();
    }

    /**
     * <code>.hassmic.MediaPlayerState new_state = 2;</code>
     *
     * @param value The newState to set.
     * @return This builder for chaining.
     */
    public Builder setNewStateValue(int value) {
      copyOnWrite();
      instance.setNewStateValue(value);
      return this;
    }

    /**
     * <code>.hassmic.MediaPlayerState new_state = 2;</code>
     *
     * @return The newState.
     */
    @java.lang.Override
    public com.thejeffcooper.hassmic.proto.MediaPlayerState getNewState() {
      return instance.getNewState();
    }

    /**
     * <code>.hassmic.MediaPlayerState new_state = 2;</code>
     *
     * @param value The enum numeric value on the wire for newState to set.
     * @return This builder for chaining.
     */
    public Builder setNewState(com.thejeffcooper.hassmic.proto.MediaPlayerState value) {
      copyOnWrite();
      instance.setNewState(value);
      return this;
    }

    /**
     * <code>.hassmic.MediaPlayerState new_state = 2;</code>
     *
     * @return This builder for chaining.
     */
    public Builder clearNewState() {
      copyOnWrite();
      instance.clearNewState();
      return this;
    }

    // @@protoc_insertion_point(builder_scope:hassmic.MediaPlayerStateChange)
  }

  @java.lang.Override
  @java.lang.SuppressWarnings({"unchecked", "fallthrough"})
  protected final java.lang.Object dynamicMethod(
      com.google.protobuf.GeneratedMessageLite.MethodToInvoke method,
      java.lang.Object arg0,
      java.lang.Object arg1) {
    switch (method) {
      case NEW_MUTABLE_INSTANCE:
        {
          return new com.thejeffcooper.hassmic.proto.MediaPlayerStateChange();
        }
      case NEW_BUILDER:
        {
          return new Builder();
        }
      case BUILD_MESSAGE_INFO:
        {
          java.lang.Object[] objects =
              new java.lang.Object[] {
                "player_", "newState_",
              };
          java.lang.String info =
              "\u0000\u0002\u0000\u0000\u0001\u0002\u0002\u0000\u0000\u0000\u0001\f\u0002\f";
          return newMessageInfo(DEFAULT_INSTANCE, info, objects);
        }
        // fall through
      case GET_DEFAULT_INSTANCE:
        {
          return DEFAULT_INSTANCE;
        }
      case GET_PARSER:
        {
          com.google.protobuf.Parser<com.thejeffcooper.hassmic.proto.MediaPlayerStateChange>
              parser = PARSER;
          if (parser == null) {
            synchronized (com.thejeffcooper.hassmic.proto.MediaPlayerStateChange.class) {
              parser = PARSER;
              if (parser == null) {
                parser =
                    new DefaultInstanceBasedParser<
                        com.thejeffcooper.hassmic.proto.MediaPlayerStateChange>(DEFAULT_INSTANCE);
                PARSER = parser;
              }
            }
          }
          return parser;
        }
      case GET_MEMOIZED_IS_INITIALIZED:
        {
          return (byte) 1;
        }
      case SET_MEMOIZED_IS_INITIALIZED:
        {
          return null;
        }
    }
    throw new UnsupportedOperationException();
  }

  // @@protoc_insertion_point(class_scope:hassmic.MediaPlayerStateChange)
  private static final com.thejeffcooper.hassmic.proto.MediaPlayerStateChange DEFAULT_INSTANCE;

  static {
    MediaPlayerStateChange defaultInstance = new MediaPlayerStateChange();
    // New instances are implicitly immutable so no need to make
    // immutable.
    DEFAULT_INSTANCE = defaultInstance;
    com.google.protobuf.GeneratedMessageLite.registerDefaultInstance(
        MediaPlayerStateChange.class, defaultInstance);
  }

  public static com.thejeffcooper.hassmic.proto.MediaPlayerStateChange getDefaultInstance() {
    return DEFAULT_INSTANCE;
  }

  private static volatile com.google.protobuf.Parser<MediaPlayerStateChange> PARSER;

  public static com.google.protobuf.Parser<MediaPlayerStateChange> parser() {
    return DEFAULT_INSTANCE.getParserForType();
  }
}