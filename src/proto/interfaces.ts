import * as pb from "./etco";
import type { RpcOptions, UnaryCall } from "@protobuf-ts/runtime-rpc";

export interface TypeBundle<P> {
  inner: { [bundleKey: string]: P };
}

export interface TypeMapsBuilder<P> {
  [typeId: number]: TypeBundle<P>;
}

export interface RPCRequest {}

export interface RPCRequestWithAuth extends RPCRequest {
  auth?: pb.AuthRequest;
}

export interface RPCRequestWithLocationNaming extends Request {
  includeLocationNaming?: pb.IncludeLocationNaming;
}

export interface RPCRequestWithLocationInfo
  extends RPCRequestWithLocationNaming {
  includeLocationInfo: boolean;
}

export interface RPCResponse {
  // every single response has an error field
  error?: pb.ErrorResponse;
}

export interface RPCResponseWithAuth extends RPCResponse {
  auth?: pb.AuthResponse;
}

export interface RPCResponseWithLocationNaming extends RPCResponse {
  locationNamingMaps?: pb.LocationNamingMaps;
}

export interface RPCResponseWithTypeMapsBuilder<P> extends RPCResponse {
  builder: TypeMapsBuilder<P>;
}

export interface CfgMergeResponse extends RPCResponseWithAuth {
  modified: boolean;
}

export interface RPCMethod<RQ extends RPCRequest, RP extends RPCResponse> {
  (input: RQ, options?: RpcOptions): UnaryCall<RQ, RP>;
}

// export interface PricedItem {
//   typeId: number;
//   pricePerUnit: number;
//   description: string;
//   typeNamingIndexes?: pb.TypeNamingIndexes;
// }

// export interface PricedChildItem extends PricedItem {
//   quantityPerParent: number;
// }

// export interface PricedParentItem extends PricedItem {
//   children?: PricedChildItem[];
//   feePerUnit?: number;
//   quantity: number;
// }
