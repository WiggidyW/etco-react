"use server";

import * as pb from "@/proto/etco";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import {
  ParsedJSONError,
  ParsedJSONErrorMessage,
  unknownToError,
  unknownToParsedJSONError,
} from "@/error/error";
import {
  RPCRequest,
  RPCResponse,
  RPCMethod,
  RPCResponseWithAuth,
} from "@/proto/interfaces";
import { GrpcTransport } from "@protobuf-ts/grpc-transport";
import { ChannelCredentials } from "@grpc/grpc-js";
import { RpcError } from "@protobuf-ts/runtime-rpc";
import { ThrowKind, throwErr } from "../throw";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { PRIVATE_ENV } from "@/env/private";

export type StoreKind = "shop" | "buyback";
export type BuybackKinded<B> = { kind: "buyback"; value: B };
export type ShopKinded<S> = { kind: "shop"; value: S };
export type StoreKinded<B, S> = BuybackKinded<B> | ShopKinded<S>;

export const newBuybackKinded = <B>(value: B): BuybackKinded<B> => ({
  kind: "buyback",
  value,
});
export const newShopKinded = <S>(value: S): ShopKinded<S> => ({
  kind: "shop",
  value,
});

export const asIs = <RP>(rep: RP): RP => rep;

// Serializing objects with symbols results in a warning by NextJS.
// This is a workaround to prevent clutter without re-allocating each object.
const ORIGINAL_Object_dot_getOwnPropertySymbols = Object.getOwnPropertySymbols;
Object.getOwnPropertySymbols = function (o: any): symbol[] {
  return ORIGINAL_Object_dot_getOwnPropertySymbols(o).filter(
    (symbol) => symbol !== MESSAGE_TYPE
  );
};

class GrpcClient {
  private static _instance: pbClient | null = null;
  static instance(): pbClient {
    if (GrpcClient._instance === null) {
      try {
        GrpcClient._instance = new pbClient(
          new GrpcTransport({
            host: PRIVATE_ENV.GRPC_URL,
            channelCredentials: ChannelCredentials.createSsl(),
          })
        );
      } catch (e) {
        const err = unknownToError(e);
        throw new ParsedJSONError(
          {
            kind: ["GRPCClientConstruction"],
            message: err.message,
          },
          e
        );
      }
    }
    return GrpcClient._instance;
  }
}

const handleRPCError = (error: unknown): never => {
  let message: ParsedJSONErrorMessage;

  if (error instanceof RpcError) {
    message = {
      kind: ["GRPCDispatch", "RpcError"],
      message: error.message,
      code: error.code,
    };
  } else {
    const asError = unknownToError(error);
    message = {
      kind: ["GRPCDispatch"],
      message: asError.message,
    };
  }

  throw new ParsedJSONError(message, error);
};

const checkProtoError = <RP extends RPCResponse>(rep: RP): RP => {
  if (rep.error !== undefined && rep.error.code !== pb.ErrorCode.OK) {
    throw new ParsedJSONError(
      {
        kind: ["ProtoErrorResponse"],
        message: rep.error.error,
        code: pb.ErrorCode[rep.error.code],
      },
      rep.error
    );
  }
  return rep;
};

const checkAuthorized = <RP extends RPCResponseWithAuth>(rep: RP): RP => {
  if (rep.auth === undefined || rep.auth.authorized === false) {
    throw new ParsedJSONError(
      {
        kind: ["NotAuthorized"],
        message: "Not Authorized",
      },
      rep.auth ?? "undefined auth response"
    );
  }
  return rep;
};

export const dispatch = async <
  RQ extends RPCRequest,
  RP extends RPCResponse,
  V
>(
  method: RPCMethod<RQ, RP>,
  input: RQ,
  transform: (rep: RP) => V | Promise<V>,
  throwKind?: ThrowKind
): Promise<V> => {
  try {
    return await method
      .call(GrpcClient.instance(), input)
      .response.catch((e) => handleRPCError(e))
      .then(checkProtoError)
      .then(transform);
  } catch (e) {
    const error = unknownToParsedJSONError(e);
    if (!error.message.kind.includes("GRPC")) {
      error.message.kind = ["GRPC", ...error.message.kind];
    }
    if ("method" in error.message && Array.isArray(error.message.method)) {
      error.message.method = [method.name, ...error.message.method];
    } else {
      error.message.method = [method.name];
    }
    return throwErr(error, throwKind);
  }
};

export const dispatchAuthenticated = <
  RQ extends RPCRequest,
  RP extends RPCResponseWithAuth,
  V
>(
  method: RPCMethod<RQ, RP>,
  input: RQ,
  transform: (rep: RP) => V | Promise<V>,
  throwKind?: ThrowKind
): Promise<V> =>
  dispatch(method, input, (rep) => transform(checkAuthorized(rep)), throwKind);

export const throwInvalid = (
  message: string,
  throwKind?: ThrowKind,
  {
    kind = [],
    ...rest
  }: { kind?: string[]; message?: never; [key: string]: unknown } = {}
): never =>
  throwErr(
    new ParsedJSONError({
      kind: ["ProtoInvalidResponse", ...kind],
      message,
      ...rest,
    }),
    throwKind
  );
