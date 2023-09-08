import { ErrorCode as pbErrorCode } from "./etco";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
import { EtcoError } from "@/error/error";
import {
  RPCRequest,
  RPCResponse,
  RPCMethod,
  RequestWithAuth,
  ResponseWithAuth,
} from "./custom_interfaces";
import { TokenLock } from "@/storage/appAuth/nativetoken/token_storage";
import { GrpcClientManager } from "./client_manager";
import { TokenManager } from "@/storage/appAuth/nativetoken/manager";

export const dispatchAnonymousRPC = <
  RQ extends RPCRequest,
  RP extends RPCResponse
>(
  method: RPCMethod<RQ, RP>,
  request: RQ,
  handleOk: (rep: RP) => void,
  handleErr: (err: EtcoError) => void,
  options?: RpcOptions
): Promise<void> => {
  const handleRep = (rep: RP) =>
    handleAnonymousResponse(rep, handleOk, handleErr);
  return dispatchRPC(method, request, handleRep, handleErr, options);
};

export const dispatchAuthenticatedRPC = <
  RQ extends RequestWithAuth,
  RP extends ResponseWithAuth
>(
  method: RPCMethod<RQ, RP>,
  request: RQ,
  characterId: number,
  handleOk: (rep: RP) => void,
  handleErr: (err: EtcoError) => void,
  browserLockTTL?: number,
  options?: RpcOptions
): Promise<void> => {
  const tokenManager = TokenManager.getInstance(characterId);
  return tokenManager
    .getTokenAndLock(browserLockTTL)
    .then(({ token, lock }) => {
      const handleRep = (rep: RP) =>
        handleAuthenticatedResponse(
          rep,
          lock,
          tokenManager,
          handleOk,
          handleErr
        );
      request.auth = { token };
      dispatchRPC(method, request, handleRep, handleErr, options);
    })
    .catch((err) => handleErr(EtcoError.newStorageError(err)));
};

const dispatchRPC = <RQ extends RPCRequest, RP extends RPCResponse>(
  method: RPCMethod<RQ, RP>,
  request: RQ,
  handleRep: (rep: RP) => void,
  handleErr: (err: EtcoError) => void,
  options?: RpcOptions
): Promise<void> => {
  try {
    const grpcClient = GrpcClientManager.getClient();
    return method
      .call(grpcClient, request, options)
      .response.then((rep) => handleRep(rep))
      .catch((err) => handleErr(EtcoError.newRPCError(err)));
  } catch (err) {
    handleErr(EtcoError.newClientConstructionError(err as Error));
    return Promise.resolve();
  }
};

const handleAnonymousResponse = <RP extends RPCResponse>(
  rep: RP,
  handleOk: (rep: RP) => void,
  handleErr: (err: EtcoError) => void
): void => {
  if (rep.error !== undefined && rep.error.code !== pbErrorCode.OK) {
    handleErr(EtcoError.newProtoError(rep.error));
  } else {
    handleOk(rep);
  }
};

const handleAuthenticatedResponse = <RP extends ResponseWithAuth>(
  rep: RP,
  tokenLock: TokenLock,
  tokenManager: TokenManager,
  handleOk: (rep: RP) => void,
  handleErr: (err: EtcoError) => void
): void => {
  // no matter what, we need to set the token and/or unlock
  if (rep.auth !== undefined && rep.auth.token !== "") {
    tokenManager.setTokenAndUnlock(rep.auth.token, tokenLock);
  } else {
    tokenManager.unlock(tokenLock);
  }

  // proto errors have priority over unauthenticated
  if (rep.error !== undefined && rep.error.code !== pbErrorCode.OK) {
    handleErr(EtcoError.newProtoError(rep.error));

    // if not authenticated, return an auth failure
  } else if (rep.auth === undefined || rep.auth.authorized === false) {
    handleErr(EtcoError.newAuthFailure());
  } else {
    rep.auth = undefined;
    handleOk(rep);
  }
};
