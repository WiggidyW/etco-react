import * as pb from "./etco";
import * as pbClient from "./etco.client";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
import { useEffect, useState } from "react";
import { EtcoError } from "@/error/error";
import {
  RPCResponse,
  RPCMethod,
  RequestWithAuth,
  ResponseWithAuth,
  withLocationInfo,
} from "./custom_interfaces";
import { dispatchAnonymousRPC, dispatchAuthenticatedRPC } from "./dispatch";

export const repAsIs = <RP>(rep: RP): RP => rep;
