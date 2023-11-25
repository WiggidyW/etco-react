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
  refreshToken: string;
}

export interface RPCResponse {
  // every single response has an error field
  error?: pb.ErrorResponse;
}

export interface RPCResponseWithAuth extends RPCResponse {
  authorized: boolean;
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
