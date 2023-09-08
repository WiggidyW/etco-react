import { ErrorResponse } from "@/proto/etco";
import { RpcError, RpcStatus } from "@protobuf-ts/runtime-rpc";

export enum EtcoErrorKind {
  UnknownError = 0,
  StorageError = 1,
  RPCError = 2, // transport error / bad status code (protobuf-ts combines these)
  ProtoError = 3, // server returned an error in the response + status ok
  AuthFailure = 4,
  ValidationError = 5,
  ClientConstructionError = 6,
}

const EtcoErrorKindToString = (kind: EtcoErrorKind): string => {
  switch (kind) {
    case EtcoErrorKind.UnknownError:
      return "UnknownError";
    case EtcoErrorKind.StorageError:
      return "StorageError";
    case EtcoErrorKind.RPCError:
      return "RPCError";
    case EtcoErrorKind.ProtoError:
      return "ProtoError";
    case EtcoErrorKind.AuthFailure:
      return "AuthFailure";
    case EtcoErrorKind.ValidationError:
      return "ValidationError";
    case EtcoErrorKind.ClientConstructionError:
      return "ClientConstructionError";
    // default:
    //   return "UnknownError";
  }
};

export interface IEtcoError {
  kind: EtcoErrorKind;
  error: any | Error | ErrorResponse | RpcError | RpcStatus | null | string;
}

export class EtcoError {
  readonly kind: EtcoErrorKind;
  readonly error: any | ErrorResponse | RpcError | RpcStatus | null | string;

  private constructor(
    kind: EtcoErrorKind,
    error: any | Error | ErrorResponse | RpcError | RpcStatus | null | string
  ) {
    this.kind = kind;
    this.error = error;
  }

  static newUnknownError(err: any): EtcoError {
    return new EtcoError(EtcoErrorKind.UnknownError, err);
  }

  static newClientConstructionError(err: Error): EtcoError {
    return new EtcoError(EtcoErrorKind.ClientConstructionError, err);
  }

  static newStorageError(err: Error): EtcoError {
    return new EtcoError(EtcoErrorKind.StorageError, err);
  }

  static newProtoError(err: ErrorResponse): EtcoError {
    return new EtcoError(EtcoErrorKind.ProtoError, err);
  }

  static newRPCError(err: RpcError): EtcoError {
    return new EtcoError(EtcoErrorKind.RPCError, err);
  }

  static newAuthFailure(): EtcoError {
    return new EtcoError(EtcoErrorKind.AuthFailure, null);
  }

  static newValidationError(err: Error): EtcoError {
    return new EtcoError(EtcoErrorKind.ValidationError, err);
  }

  public get message(): string {
    return this.toString();
  }

  public get cause():
    | any
    | Error
    | ErrorResponse
    | RpcError
    | RpcStatus
    | null
    | string {
    return this.error;
  }

  toString(): string {
    return `EtcoError: ${EtcoErrorKindToString(this.kind)}: ${JSON.stringify(
      this.error,
      null,
      2
    )}`;
  }
}
