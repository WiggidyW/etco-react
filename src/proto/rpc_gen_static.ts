import * as pb from "./etco";
import * as pbClient from "./etco.client";
import { RPCResponse, RPCMethod, RPCRequest } from "./custom_interfaces";
import { dispatchAnonymousRPC } from "./dispatch";
import * as sdt from "./staticdata/types";
import fs from "fs";

const SDE_TYPES_FILENAME: string = "sde_types.ts";
const BUYBACK_SYSTEMS_FILENAME: string = "buyback_systems.ts";
const SHOP_LOCATIONS_FILENAME: string = "shop_locations.ts";

export const generateStaticData = async (dirPath: string): Promise<void> => {
  await Promise.all([
    getTransformWriteNamedSDETypeData(dirPath + "/" + SDE_TYPES_FILENAME),
    getTransformWriteBuybackSystems(dirPath + "/" + BUYBACK_SYSTEMS_FILENAME),
    getTransformWriteShopLocations(dirPath + "/" + SHOP_LOCATIONS_FILENAME),
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
  const { buybackSystems, regionNames } = transformBuybackSystems(rep);
  return writeBuybackSystems(filePath, buybackSystems, regionNames);
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
): Promise<RP> => {
  // setting it like this is a bit hacky, but it works
  let response: RP | null = null;

  await dispatchAnonymousRPC(
    method,
    request,
    (rep) => {
      response = rep;
    },
    (err) => {
      throw err;
    }
  );

  if (response === null) throw new Error("response is null");
  return response;
};

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

const transformBuybackSystems = (
  rep: pb.BuybackSystemsResponse
): {
  buybackSystems: sdt.BuybackSystems;
  regionNames: sdt.RegionNames;
} => {
  if (rep.locationNamingMaps === undefined) {
    throw new Error("locationNamingMaps is undefined");
  }

  const buybackSystems: sdt.BuybackSystems = {};

  for (const system of rep.systems) {
    try {
      const systemName = rep.locationNamingMaps.systemNames[system.systemId];
      if (systemName === "") {
        throw new Error(`systemId ${system.systemId} has empty systemName`);
      }
      buybackSystems[system.systemId] = {
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

  return {
    buybackSystems: buybackSystems,
    regionNames: rep.locationNamingMaps.regionNames,
  };
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
    if (location.locationInfo.forbiddenStructure) {
      locationName = "";
    } else
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
): Promise<void> => {
  return fs.writeFile(filePath, fileContent, "utf8", (err) => {
    if (err !== null) throw err;
  });
};

const writeNamedSDETypeData = async (
  filePath: string,
  types: sdt.SDETypes,
  groupNames: sdt.GroupNames,
  categoryNames: sdt.CategoryNames,
  marketGroupNames: sdt.MarketGroupNames
): Promise<void> => {
  let fileContent: string = "";
  fileContent += `import * as sdt from "./types";\n`;
  fileContent += `export const SDE_TYPE_DATA: sdt.SDETypes = ${JSON.stringify(
    types
  )};\n`;
  fileContent += `export const GROUP_NAMES: sdt.GroupNames = ${JSON.stringify(
    groupNames
  )};\n`;
  fileContent += `export const CATEGORY_NAMES: sdt.CategoryNames = ${JSON.stringify(
    categoryNames
  )};\n`;
  fileContent += `export const MARKET_GROUP_NAMES: sdt.MarketGroupNames = ${JSON.stringify(
    marketGroupNames
  )};\n`;
  return writeFile(filePath, fileContent);
};

const writeBuybackSystems = async (
  filePath: string,
  buybackSystems: sdt.BuybackSystems,
  regionNames: sdt.RegionNames
): Promise<void> => {
  let fileContent: string = "";
  fileContent += `import * as sdt from "./types";\n`;
  fileContent += `export const BUYBACK_SYSTEMS: sdt.BuybackSystems = ${JSON.stringify(
    buybackSystems
  )};\n`;
  fileContent += `export const REGION_NAMES: sdt.RegionNames = ${JSON.stringify(
    regionNames
  )};\n`;
  return writeFile(filePath, fileContent);
};

const writeShopLocations = async (
  filePath: string,
  shopLocations: sdt.ShopLocations,
  systemNames: sdt.SystemNames,
  regionNames: sdt.RegionNames
): Promise<void> => {
  let fileContent: string = "";
  fileContent += `import * as sdt from "./types";\n`;
  fileContent += `export const SHOP_LOCATIONS: sdt.ShopLocations = ${JSON.stringify(
    shopLocations
  )};\n`;
  fileContent += `export const SYSTEM_NAMES: sdt.SystemNames = ${JSON.stringify(
    systemNames
  )};\n`;
  fileContent += `export const REGION_NAMES: sdt.RegionNames = ${JSON.stringify(
    regionNames
  )};\n`;
  return writeFile(filePath, fileContent);
};
