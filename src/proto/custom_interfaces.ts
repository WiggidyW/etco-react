import * as pb from "./etco";
import type { RpcOptions, UnaryCall } from "@protobuf-ts/runtime-rpc";

export interface RPCRequest {}

export interface RequestWithAuth extends RPCRequest {
  auth?: pb.AuthRequest;
}

export interface RequestWithLocationNaming extends Request {
  includeLocationNaming?: pb.IncludeLocationNaming;
}

export interface RequestWithLocationInfo extends RequestWithLocationNaming {
  includeLocationInfo: boolean;
}

export const withLocationInfo = <RQ extends RequestWithLocationInfo>(
  request: Partial<RQ>,
  includeLocationName: boolean,
  includeSystemName: boolean,
  includeRegionName: boolean
): RQ => {
  if (includeLocationName || includeSystemName || includeRegionName) {
    request.includeLocationInfo = true;
    request.includeLocationNaming = {
      includeLocationName,
      includeSystemName,
      includeRegionName,
    };
  } else {
    request.includeLocationInfo = false;
    request.includeLocationNaming = undefined;
  }
  return request as RQ;
};

export interface RPCResponse {
  // every single response has an error field
  error?: pb.ErrorResponse;
}

export interface ResponseWithAuth extends RPCResponse {
  auth?: pb.AuthResponse;
}

export interface ResponseWithLocationNaming extends RPCResponse {
  locationNamingMaps?: pb.LocationNamingMaps;
}

export interface RPCMethod<RQ extends RPCRequest, RP extends RPCResponse> {
  (input: RQ, options?: RpcOptions): UnaryCall<RQ, RP>;
}
