"use server";

import * as pb from "@/proto/etco";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { ThrowKind } from "../throw";
import { asIs, dispatch, throwInvalid } from "./grpc";
import {
  RPCResponseWithTypeMapsBuilder,
  TypeMapsBuilder,
} from "@/proto/interfaces";
import { ICharacter } from "@/browser/character";
import { ICorporation } from "@/browser/corporation";
import { IAlliance } from "@/browser/alliance";
import { allianceInfo, characterInfo, corporationInfo } from "./other";
import { withCatchResult } from "../withResult";

export const cfgGetConstDataLoad = async (
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<pb.CfgConstData> =>
  dispatch(
    pbClient.prototype.cfgGetConstData,
    { refreshToken },
    ({ constData }) =>
      constData === undefined
        ? throwInvalid("ConstData is undefined", throwKind)
        : constData,
    throwKind
  );
export const resultCfgGetConstDataLoad = withCatchResult(cfgGetConstDataLoad);

export interface CfgGetAuthListLoadRep {
  bannedCharacters: Map<number, ICharacter>;
  permitCharacters: Map<number, ICharacter>;
  bannedCorporations: Map<number, ICorporation>;
  permitCorporations: Map<number, ICorporation>;
  permitAlliances: Map<number, IAlliance>;
}
export const cfgGetUserAuthListLoad = async (
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<CfgGetAuthListLoadRep> =>
  cfgGetAuthListLoad(
    pbClient.prototype.cfgGetUserAuthList,
    refreshToken,
    throwKind
  );
export const cfgGetAdminAuthListLoad = async (
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<CfgGetAuthListLoadRep> =>
  cfgGetAuthListLoad(
    pbClient.prototype.cfgGetAdminAuthList,
    refreshToken,
    throwKind
  );
export const resultCfgGetUserAuthListLoad = withCatchResult(
  cfgGetUserAuthListLoad
);
export const resultCfgGetAdminAuthListLoad = withCatchResult(
  cfgGetAdminAuthListLoad
);

const cfgGetAuthListLoad = async (
  method:
    | typeof pbClient.prototype.cfgGetUserAuthList
    | typeof pbClient.prototype.cfgGetAdminAuthList,
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<CfgGetAuthListLoadRep> =>
  dispatch(
    method,
    { refreshToken },
    ({ authList }) => {
      if (authList === undefined) {
        return throwInvalid("AuthList is undefined", throwKind);
      }
      const {
        bannedCharacterIds,
        permitCharacterIds,
        bannedCorporationIds,
        permitCorporationIds,
        permitAllianceIds,
      } = authList;
      return Promise.all([
        authListCharacterInfo(bannedCharacterIds, throwKind),
        authListCharacterInfo(permitCharacterIds, throwKind),
        authListCorporationInfo(bannedCorporationIds, throwKind),
        authListCorporationInfo(permitCorporationIds, throwKind),
        authListAllianceInfo(permitAllianceIds, throwKind),
      ]).then(
        ([
          bannedCharacters,
          permitCharacters,
          bannedCorporations,
          permitCorporations,
          permitAlliances,
        ]) => ({
          bannedCharacters,
          permitCharacters,
          bannedCorporations,
          permitCorporations,
          permitAlliances,
        })
      );
    },
    throwKind
  );

const authListCharacterInfo = (
  ids: number[],
  throwKind?: ThrowKind
): Promise<Map<number, ICharacter>> =>
  Promise.all(
    ids.map((id) =>
      characterInfo(id, undefined, undefined, throwKind).catch(() => ({
        id,
        name: "Unknown",
        corporationId: 0,
        admin: false,
        refreshToken: "",
      }))
    )
  ).then((characters) =>
    characters.reduce((map, c) => map.set(c.id, c), new Map())
  );

const authListCorporationInfo = (
  ids: number[],
  throwKind?: ThrowKind
): Promise<Map<number, ICorporation>> =>
  Promise.all(
    ids.map((id) =>
      corporationInfo(id, throwKind).catch(() => ({
        id,
        name: "Unknown",
        ticker: "",
      }))
    )
  ).then((corporations) =>
    corporations.reduce((map, c) => map.set(c.id, c), new Map())
  );

const authListAllianceInfo = (
  ids: number[],
  throwKind?: ThrowKind
): Promise<Map<number, IAlliance>> =>
  Promise.all(
    ids.map((id) =>
      allianceInfo(id, throwKind).catch(() => ({
        id,
        name: "Unknown",
        ticker: "",
      }))
    )
  ).then((alliances) =>
    alliances.reduce((map, a) => map.set(a.id, a), new Map())
  );

interface LocationInfoMap {
  locationInfoMap: { [locationId: string]: pb.LocationInfo };
  strs: string[];
}
const getLocationInfoMap = async (ids: number[]): Promise<LocationInfoMap> => {
  if (ids.length === 0) {
    return { locationInfoMap: {}, strs: [] };
  }

  const { locations, strs } = await dispatch(
    pbClient.prototype.locations,
    { locations: ids },
    asIs,
    ThrowKind.Parsed
  );

  const locationInfoMap: { [locationId: string]: pb.LocationInfo } = {};
  for (const location of locations) {
    locationInfoMap[location.locationId.toString()] = location;
  }

  return { locationInfoMap, strs };
};

export interface CfgGetMarketsLoadRep {
  markets: { [marketName: string]: pb.CfgMarket };
  locationInfoMap: { [locationId: string]: pb.LocationInfo };
  strs: string[];
}
export const cfgGetMarketsLoad = async (
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<CfgGetMarketsLoadRep> =>
  dispatch(
    pbClient.prototype.cfgGetMarkets,
    { refreshToken },
    async ({ markets }) => {
      const locationIdsSet = new Set<number>();
      for (const market of Object.values(markets)) {
        locationIdsSet.add(market.locationId);
      }
      const locationIds = [...locationIdsSet];
      const { locationInfoMap, strs } = await getLocationInfoMap(locationIds);
      return { markets, locationInfoMap, strs };
    },
    throwKind
  );
export const resultCfgGetMarketsLoad = withCatchResult(cfgGetMarketsLoad);

export interface CfgGetShopLocationsLoadRep {
  locations: { [locationId: number]: pb.CfgShopLocation };
  locationInfoMap: { [locationId: string]: pb.LocationInfo };
  strs: string[];
  bundleKeys: string[];
}
export const cfgGetShopLocationsLoad = async (
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<CfgGetShopLocationsLoadRep> => {
  const [locationData, bundleKeys] = await Promise.all([
    dispatch(
      pbClient.prototype.cfgGetShopLocations,
      { refreshToken },
      async ({ locations }) => {
        const { locationInfoMap, strs } = await getLocationInfoMap(
          Object.keys(locations).map((id) => parseInt(id))
        );
        return { locations, locationInfoMap, strs };
      },
      throwKind
    ),
    dispatch(
      pbClient.prototype.cfgGetShopBundleKeys,
      { refreshToken },
      ({ bundleKeys }) => bundleKeys,
      throwKind
    ),
  ]);
  return { bundleKeys, ...locationData };
};
export const resultCfgGetShopLocationsLoad = withCatchResult(
  cfgGetShopLocationsLoad
);

export interface CfgGetBuybackSystemsLoadRep {
  systems: { [systemId: number]: pb.CfgBuybackSystem };
  bundleKeys: string[];
}
export const cfgGetBuybackSystemsLoad = async (
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<CfgGetBuybackSystemsLoadRep> => {
  const [systems, bundleKeys] = await Promise.all([
    dispatch(
      pbClient.prototype.cfgGetBuybackSystems,
      { refreshToken },
      ({ systems }) => systems,
      throwKind
    ),
    dispatch(
      pbClient.prototype.cfgGetBuybackBundleKeys,
      { refreshToken },
      ({ bundleKeys }) => bundleKeys,
      throwKind
    ),
  ]);
  return { systems, bundleKeys };
};
export const resultCfgGetBuybackSystemsLoad = withCatchResult(
  cfgGetBuybackSystemsLoad
);

export interface CfgGetBuybackSystemTypeMapsBuilderLoadRep {
  builder: { [key: number]: pb.CfgBuybackSystemTypeBundle };
  bundleKeys: Set<string>;
  marketNames: string[];
}
export const cfgGetBuybackSystemTypeMapsBuilderLoad = async (
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<CfgGetBuybackSystemTypeMapsBuilderLoadRep> => {
  const [{ builder, bundleKeys }, marketNames] = await Promise.all([
    dispatch(
      pbClient.prototype.cfgGetBuybackSystemTypeMapsBuilder,
      { refreshToken },
      builderWithBundleKeys<
        pb.CfgBuybackTypePricing,
        pb.CfgGetBuybackSystemTypeMapsBuilderResponse
      >,
      throwKind
    ),
    dispatch(
      pbClient.prototype.cfgGetMarketNames,
      { refreshToken },
      ({ marketNames }) => marketNames,
      throwKind
    ),
  ]);
  return { builder, bundleKeys, marketNames };
};
export const resultCfgGetBuybackSystemTypeMapsBuilderLoad = withCatchResult(
  cfgGetBuybackSystemTypeMapsBuilderLoad
);

export interface CfgGetShopLocationTypeMapsBuilderLoadRep {
  builder: { [key: number]: pb.CfgShopLocationTypeBundle };
  bundleKeys: Set<string>;
  marketNames: string[];
}
export const cfgGetShopLocationTypeMapsBuilderLoad = async (
  refreshToken: string,
  throwKind?: ThrowKind
): Promise<CfgGetShopLocationTypeMapsBuilderLoadRep> => {
  const [{ builder, bundleKeys }, marketNames] = await Promise.all([
    dispatch(
      pbClient.prototype.cfgGetShopLocationTypeMapsBuilder,
      { refreshToken },
      builderWithBundleKeys<
        pb.CfgShopTypePricing,
        pb.CfgGetShopLocationTypeMapsBuilderResponse
      >,
      throwKind
    ),
    dispatch(
      pbClient.prototype.cfgGetMarketNames,
      { refreshToken },
      ({ marketNames }) => marketNames,
      throwKind
    ),
  ]);
  return { builder, bundleKeys, marketNames };
};
export const resultCfgGetShopLocationTypeMapsBuilderLoad = withCatchResult(
  cfgGetShopLocationTypeMapsBuilderLoad
);

interface BuilderWithBundleKeys<P> {
  builder: TypeMapsBuilder<P>;
  bundleKeys: Set<string>;
}
const builderWithBundleKeys = <P, RP extends RPCResponseWithTypeMapsBuilder<P>>(
  rep: RP
): BuilderWithBundleKeys<P> => {
  const builder = rep.builder;
  const bundleKeys = new Set<string>();
  for (const typeId in builder) {
    for (const bundleKey in builder[typeId].inner) {
      bundleKeys.add(bundleKey);
    }
  }
  return { builder, bundleKeys };
};
