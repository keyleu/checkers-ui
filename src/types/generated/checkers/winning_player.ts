/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "alice.checkers.checkers";

export interface WinningPlayer {
  playerAddress: string;
  wonCount: Long;
  dateAdded: string;
}

function createBaseWinningPlayer(): WinningPlayer {
  return { playerAddress: "", wonCount: Long.UZERO, dateAdded: "" };
}

export const WinningPlayer = {
  encode(
    message: WinningPlayer,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.playerAddress !== "") {
      writer.uint32(10).string(message.playerAddress);
    }
    if (!message.wonCount.isZero()) {
      writer.uint32(16).uint64(message.wonCount);
    }
    if (message.dateAdded !== "") {
      writer.uint32(26).string(message.dateAdded);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WinningPlayer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWinningPlayer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.playerAddress = reader.string();
          break;
        case 2:
          message.wonCount = reader.uint64() as Long;
          break;
        case 3:
          message.dateAdded = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WinningPlayer {
    return {
      playerAddress: isSet(object.playerAddress)
        ? String(object.playerAddress)
        : "",
      wonCount: isSet(object.wonCount)
        ? Long.fromString(object.wonCount)
        : Long.UZERO,
      dateAdded: isSet(object.dateAdded) ? String(object.dateAdded) : "",
    };
  },

  toJSON(message: WinningPlayer): unknown {
    const obj: any = {};
    message.playerAddress !== undefined &&
      (obj.playerAddress = message.playerAddress);
    message.wonCount !== undefined &&
      (obj.wonCount = (message.wonCount || Long.UZERO).toString());
    message.dateAdded !== undefined && (obj.dateAdded = message.dateAdded);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<WinningPlayer>, I>>(
    object: I
  ): WinningPlayer {
    const message = createBaseWinningPlayer();
    message.playerAddress = object.playerAddress ?? "";
    message.wonCount =
      object.wonCount !== undefined && object.wonCount !== null
        ? Long.fromValue(object.wonCount)
        : Long.UZERO;
    message.dateAdded = object.dateAdded ?? "";
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
