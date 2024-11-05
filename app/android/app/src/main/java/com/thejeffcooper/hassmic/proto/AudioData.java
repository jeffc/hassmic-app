// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: proto/hassmic.proto

package com.thejeffcooper.hassmic.proto;

/** Protobuf type {@code hassmic.AudioData} */
public final class AudioData
    extends com.google.protobuf.GeneratedMessageLite<AudioData, AudioData.Builder>
    implements
    // @@protoc_insertion_point(message_implements:hassmic.AudioData)
    AudioDataOrBuilder {
  private AudioData() {
    data_ = com.google.protobuf.ByteString.EMPTY;
  }

  public static final int DATA_FIELD_NUMBER = 1;
  private com.google.protobuf.ByteString data_;

  /**
   * <code>bytes data = 1;</code>
   *
   * @return The data.
   */
  @java.lang.Override
  public com.google.protobuf.ByteString getData() {
    return data_;
  }

  /**
   * <code>bytes data = 1;</code>
   *
   * @param value The data to set.
   */
  private void setData(com.google.protobuf.ByteString value) {
    java.lang.Class<?> valueClass = value.getClass();

    data_ = value;
  }

  /** <code>bytes data = 1;</code> */
  private void clearData() {

    data_ = getDefaultInstance().getData();
  }

  public static com.thejeffcooper.hassmic.proto.AudioData parseFrom(java.nio.ByteBuffer data)
      throws com.google.protobuf.InvalidProtocolBufferException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(DEFAULT_INSTANCE, data);
  }

  public static com.thejeffcooper.hassmic.proto.AudioData parseFrom(
      java.nio.ByteBuffer data, com.google.protobuf.ExtensionRegistryLite extensionRegistry)
      throws com.google.protobuf.InvalidProtocolBufferException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(
        DEFAULT_INSTANCE, data, extensionRegistry);
  }

  public static com.thejeffcooper.hassmic.proto.AudioData parseFrom(
      com.google.protobuf.ByteString data)
      throws com.google.protobuf.InvalidProtocolBufferException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(DEFAULT_INSTANCE, data);
  }

  public static com.thejeffcooper.hassmic.proto.AudioData parseFrom(
      com.google.protobuf.ByteString data,
      com.google.protobuf.ExtensionRegistryLite extensionRegistry)
      throws com.google.protobuf.InvalidProtocolBufferException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(
        DEFAULT_INSTANCE, data, extensionRegistry);
  }

  public static com.thejeffcooper.hassmic.proto.AudioData parseFrom(byte[] data)
      throws com.google.protobuf.InvalidProtocolBufferException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(DEFAULT_INSTANCE, data);
  }

  public static com.thejeffcooper.hassmic.proto.AudioData parseFrom(
      byte[] data, com.google.protobuf.ExtensionRegistryLite extensionRegistry)
      throws com.google.protobuf.InvalidProtocolBufferException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(
        DEFAULT_INSTANCE, data, extensionRegistry);
  }

  public static com.thejeffcooper.hassmic.proto.AudioData parseFrom(java.io.InputStream input)
      throws java.io.IOException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(DEFAULT_INSTANCE, input);
  }

  public static com.thejeffcooper.hassmic.proto.AudioData parseFrom(
      java.io.InputStream input, com.google.protobuf.ExtensionRegistryLite extensionRegistry)
      throws java.io.IOException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(
        DEFAULT_INSTANCE, input, extensionRegistry);
  }

  public static com.thejeffcooper.hassmic.proto.AudioData parseDelimitedFrom(
      java.io.InputStream input) throws java.io.IOException {
    return parseDelimitedFrom(DEFAULT_INSTANCE, input);
  }

  public static com.thejeffcooper.hassmic.proto.AudioData parseDelimitedFrom(
      java.io.InputStream input, com.google.protobuf.ExtensionRegistryLite extensionRegistry)
      throws java.io.IOException {
    return parseDelimitedFrom(DEFAULT_INSTANCE, input, extensionRegistry);
  }

  public static com.thejeffcooper.hassmic.proto.AudioData parseFrom(
      com.google.protobuf.CodedInputStream input) throws java.io.IOException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(DEFAULT_INSTANCE, input);
  }

  public static com.thejeffcooper.hassmic.proto.AudioData parseFrom(
      com.google.protobuf.CodedInputStream input,
      com.google.protobuf.ExtensionRegistryLite extensionRegistry)
      throws java.io.IOException {
    return com.google.protobuf.GeneratedMessageLite.parseFrom(
        DEFAULT_INSTANCE, input, extensionRegistry);
  }

  public static Builder newBuilder() {
    return (Builder) DEFAULT_INSTANCE.createBuilder();
  }

  public static Builder newBuilder(com.thejeffcooper.hassmic.proto.AudioData prototype) {
    return (Builder) DEFAULT_INSTANCE.createBuilder(prototype);
  }

  /** Protobuf type {@code hassmic.AudioData} */
  public static final class Builder
      extends com.google.protobuf.GeneratedMessageLite.Builder<
          com.thejeffcooper.hassmic.proto.AudioData, Builder>
      implements
      // @@protoc_insertion_point(builder_implements:hassmic.AudioData)
      com.thejeffcooper.hassmic.proto.AudioDataOrBuilder {
    // Construct using com.thejeffcooper.hassmic.proto.AudioData.newBuilder()
    private Builder() {
      super(DEFAULT_INSTANCE);
    }

    /**
     * <code>bytes data = 1;</code>
     *
     * @return The data.
     */
    @java.lang.Override
    public com.google.protobuf.ByteString getData() {
      return instance.getData();
    }

    /**
     * <code>bytes data = 1;</code>
     *
     * @param value The data to set.
     * @return This builder for chaining.
     */
    public Builder setData(com.google.protobuf.ByteString value) {
      copyOnWrite();
      instance.setData(value);
      return this;
    }

    /**
     * <code>bytes data = 1;</code>
     *
     * @return This builder for chaining.
     */
    public Builder clearData() {
      copyOnWrite();
      instance.clearData();
      return this;
    }

    // @@protoc_insertion_point(builder_scope:hassmic.AudioData)
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
          return new com.thejeffcooper.hassmic.proto.AudioData();
        }
      case NEW_BUILDER:
        {
          return new Builder();
        }
      case BUILD_MESSAGE_INFO:
        {
          java.lang.Object[] objects =
              new java.lang.Object[] {
                "data_",
              };
          java.lang.String info =
              "\u0000\u0001\u0000\u0000\u0001\u0001\u0001\u0000\u0000\u0000\u0001\n";
          return newMessageInfo(DEFAULT_INSTANCE, info, objects);
        }
        // fall through
      case GET_DEFAULT_INSTANCE:
        {
          return DEFAULT_INSTANCE;
        }
      case GET_PARSER:
        {
          com.google.protobuf.Parser<com.thejeffcooper.hassmic.proto.AudioData> parser = PARSER;
          if (parser == null) {
            synchronized (com.thejeffcooper.hassmic.proto.AudioData.class) {
              parser = PARSER;
              if (parser == null) {
                parser =
                    new DefaultInstanceBasedParser<com.thejeffcooper.hassmic.proto.AudioData>(
                        DEFAULT_INSTANCE);
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

  // @@protoc_insertion_point(class_scope:hassmic.AudioData)
  private static final com.thejeffcooper.hassmic.proto.AudioData DEFAULT_INSTANCE;

  static {
    AudioData defaultInstance = new AudioData();
    // New instances are implicitly immutable so no need to make
    // immutable.
    DEFAULT_INSTANCE = defaultInstance;
    com.google.protobuf.GeneratedMessageLite.registerDefaultInstance(
        AudioData.class, defaultInstance);
  }

  public static com.thejeffcooper.hassmic.proto.AudioData getDefaultInstance() {
    return DEFAULT_INSTANCE;
  }

  private static volatile com.google.protobuf.Parser<AudioData> PARSER;

  public static com.google.protobuf.Parser<AudioData> parser() {
    return DEFAULT_INSTANCE.getParserForType();
  }
}
