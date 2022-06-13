/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "alice.checkers.checkers";

export interface PlayerInfo {
  index: string;
  wonCount: Long;
  lostCount: Long;
  forfeitedCount: Long;
}

function createBasePlayerInfo(): PlayerInfo {
  return {
    index: "",
    wonCount: Long.UZERO,
    lostCount: Long.UZERO,
    forfeitedCount: Long.UZERO,
  };
}

export const PlayerInfo = {
  encode(
    message: PlayerInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.index !== "") {
      writer.uint32(10).string(message.index);
    }
    if (!message.wonCount.isZero()) {
      writer.uint32(16).uint64(message.wonCount);
    }
    if (!message.lostCount.isZero()) {
      writer.uint32(24).uint64(message.lostCount);
    }
    if (!message.forfeitedCount.isZero()) {
      writer.uint32(32).uint64(message.forfeitedCount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlayerInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlayerInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.index = reader.string();
          break;
        case 2:
          message.wonCount = reader.uint64() as Long;
          break;
        case 3:
          message.lostCount = reader.uint64() as Long;
          break;
        case 4:
          message.forfeitedCount = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PlayerInfo {
    return {
      index: isSet(object.index) ? String(object.index) : "",
      wonCount: isSet(object.wonCount)
        ? Long.fromString(object.wonCount)
        : Long.UZERO,
      lostCount: isSet(object.lostCount)
        ? Long.fromString(object.lostCount)
        : Long.UZERO,
      forfeitedCount: isSet(object.forfeitedCount)
        ? Long.fromString(object.forfeitedCount)
        : Long.UZERO,
    };
  },

  toJSON(message: PlayerInfo): unknown {
    const obj: any = {};
    message.index !== undefined && (obj.index = message.index);
    message.wonCount !== undefined &&
      (obj.wonCount = (message.wonCount || Long.UZERO).toString());
    message.lostCount !== undefined &&
      (obj.lostCount = (message.lostCount || Long.UZERO).toString());
    message.forfeitedCount !== undefined &&
      (obj.forfeitedCount = (message.forfeitedCount || Long.UZERO).toString());
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PlayerInfo>, I>>(
    object: I
  ): PlayerInfo {
    const message = createBasePlayerInfo();
    message.index = object.index ?? "";
    message.wonCount =
      object.wonCount !== undefined && object.wonCount !== null
        ? Long.fromValue(object.wonCount)
        : Long.UZERO;
    message.lostCount =
      object.lostCount !== undefined && object.lostCount !== null
        ? Long.fromValue(object.lostCount)
        : Long.UZERO;
    message.forfeitedCount =
      object.forfeitedCount !== undefined && object.forfeitedCount !== null
        ? Long.fromValue(object.forfeitedCount)
        : Long.UZERO;
    return message;
  },
};

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Long
  ? string | number | Long
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >;

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
