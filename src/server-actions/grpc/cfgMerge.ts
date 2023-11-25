"use server";

import * as pb from "@/proto/etco";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { ThrowKind } from "../throw";
import { asIs, dispatch } from "./grpc";
import { withCatchResult } from "../withResult";

export const cfgSetConstData = async (
  refreshToken: string,
  constData: pb.CfgConstData,
  throwKind?: ThrowKind
): Promise<pb.CfgUpdateResponse> =>
  dispatch(
    pbClient.prototype.cfgSetConstData,
    { constData, refreshToken },
    asIs,
    throwKind
  );
export const resultCfgSetConstData = withCatchResult(cfgSetConstData);

export const cfgSetUserAuthList = async (
  refreshToken: string,
  authList: pb.CfgAuthList,
  throwKind?: ThrowKind
): Promise<pb.CfgUpdateResponse> =>
  dispatch(
    pbClient.prototype.cfgSetUserAuthList,
    { authList, refreshToken },
    asIs,
    throwKind
  );
export const resultCfgSetUserAuthList = withCatchResult(cfgSetUserAuthList);

export const cfgSetAdminAuthList = async (
  refreshToken: string,
  authList: pb.CfgAuthList,
  throwKind?: ThrowKind
): Promise<pb.CfgUpdateResponse> =>
  dispatch(
    pbClient.prototype.cfgSetAdminAuthList,
    { authList, refreshToken },
    asIs,
    throwKind
  );
export const resultCfgSetAdminAuthList = withCatchResult(cfgSetAdminAuthList);

export const cfgMergeBuybackSystemTypeMapsBuilder = async (
  refreshToken: string,
  builder: { [key: number]: pb.CfgBuybackSystemTypeBundle },
  throwKind?: ThrowKind
): Promise<pb.CfgUpdateResponse> =>
  dispatch(
    pbClient.prototype.cfgMergeBuybackSystemTypeMapsBuilder,
    { builder, refreshToken },
    asIs,
    throwKind
  );
export const resultCfgMergeBuybackSystemTypeMapsBuilder = withCatchResult(
  cfgMergeBuybackSystemTypeMapsBuilder
);

export const cfgMergeShopLocationTypeMapsBuilder = async (
  refreshToken: string,
  builder: { [key: number]: pb.CfgShopLocationTypeBundle },
  throwKind?: ThrowKind
): Promise<pb.CfgUpdateResponse> =>
  dispatch(
    pbClient.prototype.cfgMergeShopLocationTypeMapsBuilder,
    { builder, refreshToken },
    asIs,
    throwKind
  );
export const resultCfgMergeShopLocationTypeMapsBuilder = withCatchResult(
  cfgMergeShopLocationTypeMapsBuilder
);

export const cfgMergeBuybackSystems = async (
  refreshToken: string,
  systems: { [systemId: number]: pb.CfgBuybackSystem },
  throwKind?: ThrowKind
): Promise<pb.CfgUpdateResponse> =>
  dispatch(
    pbClient.prototype.cfgMergeBuybackSystems,
    { systems, refreshToken },
    asIs,
    throwKind
  );
export const resultCfgMergeBuybackSystems = withCatchResult(
  cfgMergeBuybackSystems
);

export const cfgMergeShopLocations = async (
  refreshToken: string,
  locations: { [locationId: number]: pb.CfgShopLocation },
  throwKind?: ThrowKind
): Promise<pb.CfgUpdateResponse> =>
  dispatch(
    pbClient.prototype.cfgMergeShopLocations,
    { locations, refreshToken },
    asIs,
    throwKind
  );
export const resultCfgMergeShopLocations = withCatchResult(
  cfgMergeShopLocations
);

export const cfgMergeMarkets = async (
  refreshToken: string,
  markets: { [marketName: string]: pb.CfgMarket },
  throwKind?: ThrowKind
): Promise<pb.CfgUpdateResponse> =>
  dispatch(
    pbClient.prototype.cfgMergeMarkets,
    { markets, refreshToken },
    asIs,
    throwKind
  );
export const resultCfgMergeMarkets = withCatchResult(cfgMergeMarkets);
