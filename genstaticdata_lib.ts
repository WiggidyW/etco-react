import { RPCResponse, RPCMethod, RPCRequest } from "./src/proto/interfaces";
import { asIs, dispatch } from "./src/server-actions/grpc/grpc";
import { ThrowKind } from "./src/server-actions/throw";
import * as pbClient from "./src/proto/etco.client";
import * as sdt from "./src/staticdata/types";
import * as pb from "./src/proto/etco";
import { ContentBuybackSystems } from "./src/staticdata/buyback_systems";
import { ContentSdeSystems } from "./src/staticdata/sde_systems";
import { ContentShopLocations } from "./src/staticdata/shop_locations";
import { ContentSdeTypes } from "./src/staticdata/sde_types";
import fs from "fs";

const SDE_TYPES_FILENAME: string = "sde_types.json";
const SDE_SYSTEMS_FILENAME: string = "sde_systems.json";
const BUYBACK_SYSTEMS_FILENAME: string = "buyback_systems.json";
const SHOP_LOCATIONS_FILENAME: string = "shop_locations.json";

export const genStaticData = async (dirPath: string): Promise<void> => {
  await Promise.all([
    getTransformWriteNamedSDETypeData(`${dirPath}/${SDE_TYPES_FILENAME}`),
    getTransformWriteBuybackSystems(`${dirPath}/${BUYBACK_SYSTEMS_FILENAME}`),
    getTransformWriteSDESystems(`${dirPath}/${SDE_SYSTEMS_FILENAME}`),
    getTransformWriteShopLocations(`${dirPath}/${SHOP_LOCATIONS_FILENAME}`),
  ]);
};

const getTransformWriteNamedSDETypeData = async (
  filePath: string
): Promise<void> => {
  const rep = await getNamedSDETypeData();
  const { types, groupNames, categoryNames, marketGroupNames } =
    transformNamedSDETypeData(rep);
  return writeNamedSDETypeData(
    filePath,
    types,
    groupNames,
    categoryNames,
    marketGroupNames
  );
};

const getTransformWriteBuybackSystems = async (
  filePath: string
): Promise<void> => {
  const rep = await getBuybackSystems();
  const { systems, regionNames } = transformSystems(rep);
  return writeBuybackSystems(filePath, systems, regionNames);
};

const getTransformWriteSDESystems = async (filePath: string): Promise<void> => {
  const rep = await getSDESystems();
  const { systems, regionNames } = transformSystems(rep);
  return writeSDESystems(filePath, systems, regionNames);
};

const getTransformWriteShopLocations = async (
  filePath: string
): Promise<void> => {
  const rep = await getShopLocations();
  const { shopLocations, systemNames, regionNames } =
    transformShopLocations(rep);
  return writeShopLocations(filePath, shopLocations, systemNames, regionNames);
};

const getRPCResponse = async <RQ extends RPCRequest, RP extends RPCResponse>(
  method: RPCMethod<RQ, RP>,
  request: RQ
): Promise<RP> => dispatch(method, request, asIs, ThrowKind.Pretty);

const getNamedSDETypeData = async (): Promise<pb.NamedSDETypeDataResponse> =>
  getRPCResponse(pbClient.EveTradingCoClient.prototype.namedSDETypeData, {});

const getBuybackSystems = async (): Promise<pb.BuybackSystemsResponse> =>
  getRPCResponse(pbClient.EveTradingCoClient.prototype.buybackSystems, {
    includeLocationNaming: {
      includeLocationName: false,
      includeSystemName: true,
      includeRegionName: true,
    },
  });

const getSDESystems = async (): Promise<pb.SDESystemsResponse> =>
  getRPCResponse(pbClient.EveTradingCoClient.prototype.sDESystems, {
    includeLocationNaming: {
      includeLocationName: true,
      includeSystemName: true,
      includeRegionName: true,
    },
  });

const getShopLocations = async (): Promise<pb.ShopLocationsResponse> =>
  getRPCResponse(pbClient.EveTradingCoClient.prototype.shopLocations, {
    includeLocationInfo: true,
    includeLocationNaming: {
      includeLocationName: true,
      includeSystemName: true,
      includeRegionName: true,
    },
  });

const transformNamedSDETypeData = (
  rep: pb.NamedSDETypeDataResponse
): {
  types: sdt.SDETypes;
  groupNames: sdt.GroupNames;
  categoryNames: sdt.CategoryNames;
  marketGroupNames: sdt.MarketGroupNames;
} => {
  if (rep.typeNamingLists === undefined) {
    throw new Error("typeNamingLists is undefined");
  }

  const types = new Array<sdt.SDEType>(rep.types.length);

  for (let i = 0; i < rep.types.length; i++) {
    const type = rep.types[i];
    if (type.typeNamingIndexes === undefined) {
      throw new Error(`typeNamingIndexes for type ${type.typeId} is undefined`);
    } else if (type.typeNamingIndexes.groupIndex < 0) {
      throw new Error(`groupIndex for type ${type.typeId} is negative`);
    } else if (type.typeNamingIndexes.categoryIndex < 0) {
      throw new Error(`categoryIndex for type ${type.typeId} is negative`);
    } else if (type.typeNamingIndexes.marketGroupIndexes.length <= 0) {
      throw new Error(`marketGroupIndexes for type ${type.typeId} is empty`);
    }
    types[i] = { typeId: type.typeId, ...type.typeNamingIndexes };
  }

  return {
    types: types,
    groupNames: rep.typeNamingLists.groups,
    categoryNames: rep.typeNamingLists.categories,
    marketGroupNames: rep.typeNamingLists.marketGroups,
  };
};

const transformSystems = (
  rep: pb.BuybackSystemsResponse | pb.SDESystemsResponse
): {
  systems: sdt.Systems;
  regionNames: sdt.RegionNames;
} => {
  if (rep.locationNamingMaps === undefined) {
    throw new Error("locationNamingMaps is undefined");
  }

  const systems: sdt.Systems = {};

  for (const system of rep.systems) {
    try {
      const systemName = rep.locationNamingMaps.systemNames[system.systemId];
      if (systemName === "") {
        throw new Error(`systemId ${system.systemId} has empty systemName`);
      }
      systems[system.systemId] = {
        systemName: systemName,
        regionId: system.regionId,
      };
    } catch (err) {
      throw new Error(`systemId ${system.systemId} not found in systemNames`);
    }
    try {
      rep.locationNamingMaps.regionNames[system.regionId];
    } catch (err) {
      throw new Error(`regionId ${system.regionId} not found in regionNames`);
    }
  }

  return { systems, regionNames: rep.locationNamingMaps.regionNames };
};

const transformShopLocations = (
  rep: pb.ShopLocationsResponse
): {
  shopLocations: sdt.ShopLocations;
  systemNames: sdt.SystemNames;
  regionNames: sdt.RegionNames;
} => {
  if (rep.locationNamingMaps === undefined) {
    throw new Error("locationNamingMaps is undefined");
  }

  const shopLocations: sdt.ShopLocations = {};

  for (const location of rep.locations) {
    if (location.locationId > Number.MAX_SAFE_INTEGER) {
      throw new Error(`locationId ${location.locationId} is too large`);
    }
    if (location.locationInfo === undefined) {
      throw new Error(
        `locationId ${location.locationId} LocationInfo is undefined`
      );
    }
    let locationName: string;
    try {
      locationName =
        rep.locationNamingMaps.locationNames[location.locationId.toString()];
    } catch (err) {
      throw new Error(`locationId ${location.locationId} not found in names`);
    }
    shopLocations[Number(location.locationId)] = {
      locationName: locationName,
      ...location.locationInfo,
    };
    try {
      rep.locationNamingMaps.systemNames[location.locationInfo.systemId];
    } catch (err) {
      throw new Error(
        `systemId ${location.locationInfo.systemId} not found in systemNames`
      );
    }
    try {
      rep.locationNamingMaps.regionNames[location.locationInfo.regionId];
    } catch (err) {
      throw new Error(
        `regionId ${location.locationInfo.regionId} not found in regionNames`
      );
    }
  }

  return {
    shopLocations: shopLocations,
    systemNames: rep.locationNamingMaps.systemNames,
    regionNames: rep.locationNamingMaps.regionNames,
  };
};

const writeFile = async (
  filePath: string,
  fileContent: string
): Promise<void> =>
  new Promise((resolve, reject) =>
    fs.writeFile(filePath, fileContent, "utf8", (err) => {
      if (err === null) {
        resolve();
      } else {
        reject(err);
      }
    })
  );

const writeBuybackSystems = async (
  filePath: string,
  systems: sdt.Systems,
  regionNames: sdt.RegionNames
): Promise<void> => {
  let content: ContentBuybackSystems = {
    BUYBACK_SYSTEMS: systems,
    BUYBACK_REGION_NAMES: regionNames,
  };
  return writeFile(filePath, JSON.stringify(content));
};

const writeSDESystems = async (
  filePath: string,
  systems: sdt.Systems,
  regionNames: sdt.RegionNames
): Promise<void> => {
  let content: ContentSdeSystems = {
    SDE_SYSTEMS: systems,
    SDE_REGION_NAMES: regionNames,
  };
  return writeFile(filePath, JSON.stringify(content));
};

const writeShopLocations = async (
  filePath: string,
  shopLocations: sdt.ShopLocations,
  systemNames: sdt.SystemNames,
  regionNames: sdt.RegionNames
): Promise<void> => {
  let content: ContentShopLocations = {
    SHOP_LOCATIONS: shopLocations,
    SHOP_SYSTEM_NAMES: systemNames,
    SHOP_REGION_NAMES: regionNames,
  };
  return writeFile(filePath, JSON.stringify(content));
};

const writeNamedSDETypeData = async (
  filePath: string,
  types: sdt.SDETypes,
  groupNames: sdt.GroupNames,
  categoryNames: sdt.CategoryNames,
  marketGroupNames: sdt.MarketGroupNames
): Promise<void> => {
  let content: ContentSdeTypes = {
    SDE_TYPE_DATA: types,
    GROUP_NAMES: groupNames,
    CATEGORY_NAMES: categoryNames,
    MARKET_GROUP_NAMES: marketGroupNames,
  };
  return writeFile(filePath, JSON.stringify(content));
};
