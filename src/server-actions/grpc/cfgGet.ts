"use server";

import * as pb from "@/proto/etco";
import { EveTradingCoClient as pbClient } from "@/proto/etco.client";
import { ThrowKind } from "../throw";
import { dispatchAuthenticated, throwInvalid } from "./grpc";
import {
  RPCResponseWithTypeMapsBuilder,
  TypeMapsBuilder,
} from "@/proto/interfaces";
import { LocationNamesAll } from "./util";
import { ICharacter } from "@/browser/character";
import { ICorporation } from "@/browser/corporation";
import { IAlliance } from "@/browser/alliance";
import { allianceInfo, characterInfo, corporationInfo } from "./other";
import { withCatchResult } from "../withResult";

export interface CfgGetAuthListLoadRep {
  bannedCharacters: Map<number, ICharacter>;
  permitCharacters: Map<number, ICharacter>;
  bannedCorporations: Map<number, ICorporation>;
  permitCorporations: Map<number, ICorporation>;
  permitAlliances: Map<number, IAlliance>;
}
export const CfgGetAuthListLoad = async (
  token: string,
  domainKey: string,
  throwKind?: ThrowKind
): Promise<CfgGetAuthListLoadRep> =>
  dispatchAuthenticated(
    pbClient.prototype.cfgGetAuthList,
    { auth: { token }, domainKey },
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
export const resultCfgGetAuthListLoad = withCatchResult(CfgGetAuthListLoad);

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

export interface CfgGetMarketsLoadRep {
  markets: { [marketName: string]: pb.CfgMarket };
  locationInfoMap: { [locationId: string]: pb.LocationInfo };
  locationNames: { [locationId: string]: string };
  systemNames: { [systemId: number]: string };
  regionNames: { [regionId: number]: string };
}
export const cfgGetMarketsLoad = async (
  token: string,
  throwKind?: ThrowKind
): Promise<CfgGetMarketsLoadRep> =>
  dispatchAuthenticated(
    pbClient.prototype.cfgGetMarkets,
    {
      auth: { token },
      includeLocationInfo: true,
      includeLocationNaming: LocationNamesAll,
    },
    ({ markets, locationInfoMap, locationNamingMaps }) => ({
      markets,
      locationInfoMap,
      locationNames: locationNamingMaps?.locationNames || {},
      systemNames: locationNamingMaps?.systemNames || {},
      regionNames: locationNamingMaps?.regionNames || {},
    }),
    throwKind
  );
export const resultCfgGetMarketsLoad = withCatchResult(cfgGetMarketsLoad);

export interface CfgGetShopLocationsLoadRep {
  locations: { [locationId: number]: pb.CfgShopLocation };
  locationInfoMap: { [locationId: string]: pb.LocationInfo };
  locationNames: { [locationId: string]: string };
  systemNames: { [systemId: number]: string };
  regionNames: { [regionId: number]: string };
  bundleKeys: string[];
}
export const cfgGetShopLocationsLoad = async (
  token: string,
  throwKind?: ThrowKind
): Promise<CfgGetShopLocationsLoadRep> => {
  const [locationData, bundleKeys] = await Promise.all([
    dispatchAuthenticated(
      pbClient.prototype.cfgGetShopLocations,
      {
        includeLocationInfo: true,
        includeLocationNaming: LocationNamesAll,
        auth: { token },
      },
      ({ locations, locationInfoMap, locationNamingMaps }) => ({
        locations,
        locationInfoMap,
        locationNames: locationNamingMaps?.locationNames || {},
        systemNames: locationNamingMaps?.systemNames || {},
        regionNames: locationNamingMaps?.regionNames || {},
      }),
      throwKind
    ),
    dispatchAuthenticated(
      pbClient.prototype.cfgGetShopBundleKeys,
      { auth: { token } },
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
  token: string,
  throwKind?: ThrowKind
): Promise<CfgGetBuybackSystemsLoadRep> => {
  const [systems, bundleKeys] = await Promise.all([
    dispatchAuthenticated(
      pbClient.prototype.cfgGetBuybackSystems,
      { includeLocationInfo: false, auth: { token } },
      ({ systems }) => systems,
      throwKind
    ),
    dispatchAuthenticated(
      pbClient.prototype.cfgGetBuybackBundleKeys,
      { auth: { token } },
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
  token: string,
  throwKind?: ThrowKind
): Promise<CfgGetBuybackSystemTypeMapsBuilderLoadRep> => {
  const [{ builder, bundleKeys }, marketNames] = await Promise.all([
    dispatchAuthenticated(
      pbClient.prototype.cfgGetBuybackSystemTypeMapsBuilder,
      { auth: { token } },
      builderWithBundleKeys<
        pb.CfgBuybackTypePricing,
        pb.CfgGetBuybackSystemTypeMapsBuilderResponse
      >,
      throwKind
    ),
    dispatchAuthenticated(
      pbClient.prototype.cfgGetMarketNames,
      { auth: { token } },
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
  token: string,
  throwKind?: ThrowKind
): Promise<CfgGetShopLocationTypeMapsBuilderLoadRep> => {
  const [{ builder, bundleKeys }, marketNames] = await Promise.all([
    dispatchAuthenticated(
      pbClient.prototype.cfgGetShopLocationTypeMapsBuilder,
      { auth: { token } },
      builderWithBundleKeys<
        pb.CfgShopTypePricing,
        pb.CfgGetShopLocationTypeMapsBuilderResponse
      >,
      throwKind
    ),
    dispatchAuthenticated(
      pbClient.prototype.cfgGetMarketNames,
      { auth: { token } },
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
