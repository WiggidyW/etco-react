"use client";

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
import { EveAppKind } from "@/eveapps";

export interface RPCState<RP> {
  rep: RP | null;
  error: EtcoError | null;
}

export const useEsiAppLogin = <V>(
  characterId: number,
  code: string,
  appKind: EveAppKind,
  transformRep: (rep: pb.EsiAppLoginResponse) => V
): RPCState<V> => {
  const app: pb.EsiApp = (() => {
    switch (appKind) {
      case EveAppKind.Auth:
        return pb.EsiApp.EA_AUTH;
      case EveAppKind.Markets:
        return pb.EsiApp.EA_MARKETS;
      case EveAppKind.Corporation:
        return pb.EsiApp.EA_CORPORATION;
      case EveAppKind.StructureInfo:
        return pb.EsiApp.EA_STRUCTURE_INFO;
    }
  })();
  return useAuthenticatedRPC(
    pbClient.EveTradingCoClient.prototype.esiAppLogin,
    transformRep,
    characterId,
    { code, app }
  );
};

export const useParse = <V>(
  text: string,
  transformRep: (rep: pb.ParseResponse) => V
): RPCState<V> => {
  return useAnonymousRPC(
    pbClient.EveTradingCoClient.prototype.parse,
    transformRep,
    { text }
  );
};

export const useCfgGetAuthList = <V>(
  characterId: number,
  domainKey: string,
  transformRep: (rep: pb.CfgGetAuthListResponse) => V
): RPCState<V> => {
  return useAuthenticatedRPC(
    pbClient.EveTradingCoClient.prototype.cfgGetAuthList,
    transformRep,
    characterId,
    { domainKey }
  );
};

export const useCfgGetBuybackSystemTypeMapsBuilder = <V>(
  characterId: number,
  transformRep: (rep: pb.CfgGetBuybackSystemTypeMapsBuilderResponse) => V
): RPCState<V> => {
  return useAuthenticatedRPC(
    pbClient.EveTradingCoClient.prototype.cfgGetBuybackSystemTypeMapsBuilder,
    transformRep,
    characterId,
    {}
  );
};

export const useCfgGetShopLocationTypeMapsBuilder = <V>(
  characterId: number,
  transformRep: (rep: pb.CfgGetShopLocationTypeMapsBuilderResponse) => V
): RPCState<V> => {
  return useAuthenticatedRPC(
    pbClient.EveTradingCoClient.prototype.cfgGetShopLocationTypeMapsBuilder,
    transformRep,
    characterId,
    {}
  );
};

export const useCfgGetBuybackSystems = <V>(
  characterId: number,
  includeLocationName: boolean = true,
  includeSystemName: boolean = true,
  includeRegionName: boolean = true,
  transformRep: (rep: pb.CfgGetBuybackSystemsResponse) => V
): RPCState<V> => {
  return useAuthenticatedRPC(
    pbClient.EveTradingCoClient.prototype.cfgGetBuybackSystems,
    transformRep,
    characterId,
    withLocationInfo(
      {},
      includeLocationName,
      includeSystemName,
      includeRegionName
    )
  );
};

export const useCfgGetShopLocations = <V>(
  characterId: number,
  includeLocationName: boolean = true,
  includeSystemName: boolean = true,
  includeRegionName: boolean = true,
  transformRep: (rep: pb.CfgGetShopLocationsResponse) => V
): RPCState<V> => {
  return useAuthenticatedRPC(
    pbClient.EveTradingCoClient.prototype.cfgGetShopLocations,
    transformRep,
    characterId,
    withLocationInfo(
      {},
      includeLocationName,
      includeSystemName,
      includeRegionName
    )
  );
};

export const useCfgGetMarkets = <V>(
  characterId: number,
  includeLocationName: boolean = true,
  includeSystemName: boolean = true,
  includeRegionName: boolean = true,
  transformRep: (rep: pb.CfgGetMarketsResponse) => V
): RPCState<V> => {
  return useAuthenticatedRPC(
    pbClient.EveTradingCoClient.prototype.cfgGetMarkets,
    transformRep,
    characterId,
    withLocationInfo(
      {},
      includeLocationName,
      includeSystemName,
      includeRegionName
    )
  );
};

export const useCfgSetAuthList = <V>(
  characterId: number,
  domainKey: string,
  authList: pb.AuthList,
  transformRep: (rep: pb.CfgSetAuthListResponse) => V
): RPCState<V> => {
  return useAuthenticatedRPC(
    pbClient.EveTradingCoClient.prototype.cfgSetAuthList,
    transformRep,
    characterId,
    { domainKey, authList }
  );
};

export const useCfgMergeBuybackSystemTypeMapsBuilder = <V>(
  characterId: number,
  builder: { [key: number]: pb.CfgBuybackSystemTypeBundle },
  transformRep: (rep: pb.CfgMergeBuybackSystemTypeMapsBuilderResponse) => V
): RPCState<V> => {
  return useAuthenticatedRPC(
    pbClient.EveTradingCoClient.prototype.cfgMergeBuybackSystemTypeMapsBuilder,
    transformRep,
    characterId,
    { builder }
  );
};

export const useCfgMergeShopLocationTypeMapsBuilder = <V>(
  characterId: number,
  builder: { [key: number]: pb.CfgShopLocationTypeBundle },
  transformRep: (rep: pb.CfgMergeShopLocationTypeMapsBuilderResponse) => V
): RPCState<V> => {
  return useAuthenticatedRPC(
    pbClient.EveTradingCoClient.prototype.cfgMergeShopLocationTypeMapsBuilder,
    transformRep,
    characterId,
    { builder }
  );
};

export const useCfgMergeBuybackSystems = <V>(
  characterId: number,
  systems: { [key: number]: pb.CfgBuybackSystem },
  transformRep: (rep: pb.CfgMergeBuybackSystemsResponse) => V
): RPCState<V> => {
  return useAuthenticatedRPC(
    pbClient.EveTradingCoClient.prototype.cfgMergeBuybackSystems,
    transformRep,
    characterId,
    { systems }
  );
};

export const useCfgMergeShopLocations = <V>(
  characterId: number,
  locations: { [key: number]: pb.CfgShopLocation },
  transformRep: (rep: pb.CfgMergeShopLocationsResponse) => V
): RPCState<V> => {
  return useAuthenticatedRPC(
    pbClient.EveTradingCoClient.prototype.cfgMergeShopLocations,
    transformRep,
    characterId,
    { locations }
  );
};

export const useCfgMergeMarkets = <V>(
  characterId: number,
  markets: { [key: string]: pb.CfgMarket },
  transformRep: (rep: pb.CfgMergeMarketsResponse) => V
): RPCState<V> => {
  return useAuthenticatedRPC(
    pbClient.EveTradingCoClient.prototype.cfgMergeMarkets,
    transformRep,
    characterId,
    { markets }
  );
};

const useAuthenticatedRPC = <
  RQ extends RequestWithAuth,
  RP extends ResponseWithAuth,
  V
>(
  method: RPCMethod<RQ, RP>,
  transformRep: (rep: RP) => V,
  characterId: number,
  request: RQ,
  browserLockTTL?: number,
  options?: RpcOptions
): RPCState<V> => {
  const dispatch = (
    setVal: (val: V) => void,
    setErr: (err: EtcoError) => void
  ) =>
    dispatchAuthenticatedRPC(
      method,
      request,
      characterId,
      handleOk(setVal, setErr, transformRep),
      handleErr(setErr),
      browserLockTTL,
      options
    );
  return useRPC(dispatch);
};

const useAnonymousRPC = <RQ extends Object, RP extends RPCResponse, V>(
  method: RPCMethod<RQ, RP>,
  transformRep: (rep: RP) => V,
  request: RQ,
  options?: RpcOptions
): RPCState<V> => {
  const dispatch = (
    setVal: (val: V) => void,
    setErr: (err: EtcoError) => void
  ) =>
    dispatchAnonymousRPC(
      method,
      request,
      handleOk(setVal, setErr, transformRep),
      handleErr(setErr),
      options
    );
  return useRPC(dispatch);
};

const handleOk =
  <RP, V>(
    setVal: (val: V) => void,
    setErr: (err: EtcoError) => void,
    transformRep: (rep: RP) => V // must only throw Error type
  ): ((rep: RP) => void) =>
  (rep: RP) => {
    try {
      const val = transformRep(rep);
      setVal(val);
    } catch (err) {
      setErr(EtcoError.newValidationError(err as Error));
    }
  };

const handleErr = (
  setErr: (err: EtcoError) => void
): ((err: EtcoError) => void) => {
  return setErr;
};

const useRPC = <V>(
  dispatch: (
    setRep: (val: V) => void,
    setErr: (err: EtcoError) => void
  ) => Promise<void>
): RPCState<V> => {
  const [rep, setRep] = useState<V | null>(null);
  const [error, setError] = useState<EtcoError | null>(null);
  useEffect(() => {
    dispatch(setRep, setError);
  }, []);
  return { rep, error };
};
