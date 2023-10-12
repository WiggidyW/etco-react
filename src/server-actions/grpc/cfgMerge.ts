"use server";

import * as pb from "@/proto/etco";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { ThrowKind } from "../throw";
import { asIs, dispatchAuthenticated } from "./grpc";
import { withCatchResult } from "../withResult";

export const cfgSetAuthList = async (
  token: string,
  domainKey: string,
  authList: pb.AuthList,
  throwKind?: ThrowKind
): Promise<pb.CfgSetAuthListResponse & { modified: boolean }> =>
  dispatchAuthenticated(
    pbClient.prototype.cfgSetAuthList,
    { authList, auth: { token }, domainKey },
    (rep) => ({ ...rep, modified: true }),
    throwKind
  );
export const resultCfgSetAuthList = withCatchResult(cfgSetAuthList);

export const cfgMergeBuybackSystemTypeMapsBuilder = async (
  token: string,
  builder: { [key: number]: pb.CfgBuybackSystemTypeBundle },
  throwKind?: ThrowKind
): Promise<pb.CfgMergeBuybackSystemTypeMapsBuilderResponse> =>
  dispatchAuthenticated(
    pbClient.prototype.cfgMergeBuybackSystemTypeMapsBuilder,
    { builder, auth: { token } },
    asIs,
    throwKind
  );
export const resultCfgMergeBuybackSystemTypeMapsBuilder = withCatchResult(
  cfgMergeBuybackSystemTypeMapsBuilder
);

export const cfgMergeShopLocationTypeMapsBuilder = async (
  token: string,
  builder: { [key: number]: pb.CfgShopLocationTypeBundle },
  throwKind?: ThrowKind
): Promise<pb.CfgMergeShopLocationTypeMapsBuilderResponse> =>
  dispatchAuthenticated(
    pbClient.prototype.cfgMergeShopLocationTypeMapsBuilder,
    { builder, auth: { token } },
    asIs,
    throwKind
  );
export const resultCfgMergeShopLocationTypeMapsBuilder = withCatchResult(
  cfgMergeShopLocationTypeMapsBuilder
);

export const cfgMergeBuybackSystems = async (
  token: string,
  systems: { [systemId: number]: pb.CfgBuybackSystem },
  throwKind?: ThrowKind
): Promise<pb.CfgMergeBuybackSystemsResponse> =>
  dispatchAuthenticated(
    pbClient.prototype.cfgMergeBuybackSystems,
    { systems, auth: { token } },
    asIs,
    throwKind
  );
export const resultCfgMergeBuybackSystems = withCatchResult(
  cfgMergeBuybackSystems
);

export const cfgMergeShopLocations = async (
  token: string,
  locations: { [locationId: number]: pb.CfgShopLocation },
  throwKind?: ThrowKind
): Promise<pb.CfgMergeShopLocationsResponse> =>
  dispatchAuthenticated(
    pbClient.prototype.cfgMergeShopLocations,
    { locations, auth: { token } },
    asIs,
    throwKind
  );
export const resultCfgMergeShopLocations = withCatchResult(
  cfgMergeShopLocations
);

export const cfgMergeMarkets = async (
  token: string,
  markets: { [marketName: string]: pb.CfgMarket },
  throwKind?: ThrowKind
): Promise<pb.CfgMergeMarketsResponse> =>
  dispatchAuthenticated(
    pbClient.prototype.cfgMergeMarkets,
    { markets, auth: { token } },
    asIs,
    throwKind
  );
export const resultCfgMergeMarkets = withCatchResult(cfgMergeMarkets);
