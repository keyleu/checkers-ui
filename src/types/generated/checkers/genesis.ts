/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { Leaderboard } from "../checkers/leaderboard";
import { NextGame } from "../checkers/next_game";
import { PlayerInfo } from "../checkers/player_info";
import { StoredGame } from "../checkers/stored_game";

export const protobufPackage = "alice.checkers.checkers";

/** GenesisState defines the checkers module's genesis state. */
export interface GenesisState {
  /** this line is used by starport scaffolding # genesis/proto/state */
  leaderboard?: Leaderboard;
  /** this line is used by starport scaffolding # genesis/proto/stateField */
  playerInfoList: PlayerInfo[];
  /** this line is used by starport scaffolding # genesis/proto/stateField */
  storedGameList: StoredGame[];
  /** this line is used by starport scaffolding # genesis/proto/stateField */
  nextGame?: NextGame;
}

function createBaseGenesisState(): GenesisState {
  return {
    leaderboard: undefined,
    playerInfoList: [],
    storedGameList: [],
    nextGame: undefined,
  };
}

export const GenesisState = {
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.leaderboard !== undefined) {
      Leaderboard.encode(
        message.leaderboard,
        writer.uint32(34).fork()
      ).ldelim();
    }
    for (const v of message.playerInfoList) {
      PlayerInfo.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.storedGameList) {
      StoredGame.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.nextGame !== undefined) {
      NextGame.encode(message.nextGame, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 4:
          message.leaderboard = Leaderboard.decode(reader, reader.uint32());
          break;
        case 3:
          message.playerInfoList.push(
            PlayerInfo.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.storedGameList.push(
            StoredGame.decode(reader, reader.uint32())
          );
          break;
        case 1:
          message.nextGame = NextGame.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GenesisState {
    return {
      leaderboard: isSet(object.leaderboard)
        ? Leaderboard.fromJSON(object.leaderboard)
        : undefined,
      playerInfoList: Array.isArray(object?.playerInfoList)
        ? object.playerInfoList.map((e: any) => PlayerInfo.fromJSON(e))
        : [],
      storedGameList: Array.isArray(object?.storedGameList)
        ? object.storedGameList.map((e: any) => StoredGame.fromJSON(e))
        : [],
      nextGame: isSet(object.nextGame)
        ? NextGame.fromJSON(object.nextGame)
        : undefined,
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};
    message.leaderboard !== undefined &&
      (obj.leaderboard = message.leaderboard
        ? Leaderboard.toJSON(message.leaderboard)
        : undefined);
    if (message.playerInfoList) {
      obj.playerInfoList = message.playerInfoList.map((e) =>
        e ? PlayerInfo.toJSON(e) : undefined
      );
    } else {
      obj.playerInfoList = [];
    }
    if (message.storedGameList) {
      obj.storedGameList = message.storedGameList.map((e) =>
        e ? StoredGame.toJSON(e) : undefined
      );
    } else {
      obj.storedGameList = [];
    }
    message.nextGame !== undefined &&
      (obj.nextGame = message.nextGame
        ? NextGame.toJSON(message.nextGame)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GenesisState>, I>>(
    object: I
  ): GenesisState {
    const message = createBaseGenesisState();
    message.leaderboard =
      object.leaderboard !== undefined && object.leaderboard !== null
        ? Leaderboard.fromPartial(object.leaderboard)
        : undefined;
    message.playerInfoList =
      object.playerInfoList?.map((e) => PlayerInfo.fromPartial(e)) || [];
    message.storedGameList =
      object.storedGameList?.map((e) => StoredGame.fromPartial(e)) || [];
    message.nextGame =
      object.nextGame !== undefined && object.nextGame !== null
        ? NextGame.fromPartial(object.nextGame)
        : undefined;
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
