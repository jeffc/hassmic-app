// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: hassmic.proto

package com.thejeffcooper.hassmic.proto;

public interface ClientInfoOrBuilder
    extends
    // @@protoc_insertion_point(interface_extends:hassmic.ClientInfo)
    com.google.protobuf.MessageLiteOrBuilder {

  /**
   *
   *
   * <pre>
   * The version, for example "0.9.2"
   * </pre>
   *
   * <code>string version = 1;</code>
   *
   * @return The version.
   */
  java.lang.String getVersion();

  /**
   *
   *
   * <pre>
   * The version, for example "0.9.2"
   * </pre>
   *
   * <code>string version = 1;</code>
   *
   * @return The bytes for version.
   */
  com.google.protobuf.ByteString getVersionBytes();

  /**
   * <code>string uuid = 2;</code>
   *
   * @return The uuid.
   */
  java.lang.String getUuid();

  /**
   * <code>string uuid = 2;</code>
   *
   * @return The bytes for uuid.
   */
  com.google.protobuf.ByteString getUuidBytes();
}