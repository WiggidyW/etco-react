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
  const { types, strs } = transformNamedSDETypeData(rep);
  return writeNamedSDETypeData(filePath, types, strs);
};

const getTransformWriteBuybackSystems = async (
  filePath: string
): Promise<void> => {
  const rep = await getBuybackSystems();
  const { systems, strs } = transformSystems(rep);
  return writeBuybackSystems(filePath, systems, strs);
};

const getTransformWriteSDESystems = async (filePath: string): Promise<void> => {
  const rep = await getSDESystems();
  const { systems, strs } = transformSystems(rep);
  return writeSDESystems(filePath, systems, strs);
};

const getTransformWriteShopLocations = async (
  filePath: string
): Promise<void> => {
  const rep = await getShopLocations();
  const { shopLocations } = transformShopLocations(rep);
  return writeShopLocations(filePath, shopLocations);
};

const getRPCResponse = async <RQ extends RPCRequest, RP extends RPCResponse>(
  method: RPCMethod<RQ, RP>,
  request: RQ
): Promise<RP> => dispatch(method, request, asIs, ThrowKind.Pretty);

const getNamedSDETypeData = async (): Promise<pb.NamedTypesResponse> =>
  getRPCResponse(pbClient.EveTradingCoClient.prototype.allNamedTypes, {});
const getBuybackSystems = async (): Promise<pb.SystemsResponse> =>
  getRPCResponse(pbClient.EveTradingCoClient.prototype.allBuybackSystems, {});
const getSDESystems = async (): Promise<pb.SystemsResponse> =>
  getRPCResponse(pbClient.EveTradingCoClient.prototype.allSystems, {});
const getShopLocations = async (): Promise<pb.AllShopLocationsResponse> =>
  getRPCResponse(pbClient.EveTradingCoClient.prototype.allShopLocations, {});

const transformNamedSDETypeData = ({
  types,
  strs,
}: pb.NamedTypesResponse): {
  types: sdt.SDETypes;
  strs: sdt.Strs;
} => ({ types, strs });

const transformSystems = (
  rep: pb.SystemsResponse
): {
  systems: sdt.Systems;
  strs: sdt.Strs;
} => {
  const systems: sdt.Systems = {};
  for (const system of rep.systems) {
    systems[system.systemId] = {
      systemStrIndex: system.systemStrIndex,
      regionId: system.regionId,
      regionStrIndex: system.regionStrIndex,
    };
  }
  return { systems, strs: rep.strs };
};

const transformShopLocations = (
  rep: pb.AllShopLocationsResponse
): {
  shopLocations: sdt.ShopLocations;
} => {
  const shopLocations: sdt.ShopLocations = {};
  for (const location of rep.locations) {
    shopLocations[location.locationInfo!.locationId] = {
      locationName: rep.strs[location.locationInfo!.locationStrIndex],
      isStructure: location.locationInfo!.isStructure,
      forbiddenStructure: location.locationInfo!.forbiddenStructure,
      taxRate: location.taxRate,
    };
  }
  return { shopLocations };
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
  strs: sdt.Strs
): Promise<void> => {
  let content: ContentBuybackSystems = {
    BUYBACK_SYSTEMS: systems,
    STRS: strs,
  };
  return writeFile(filePath, JSON.stringify(content));
};

const writeSDESystems = async (
  filePath: string,
  systems: sdt.Systems,
  strs: sdt.Strs
): Promise<void> => {
  let content: ContentSdeSystems = {
    SDE_SYSTEMS: systems,
    STRS: strs,
  };
  return writeFile(filePath, JSON.stringify(content));
};

const writeShopLocations = async (
  filePath: string,
  shopLocations: sdt.ShopLocations
): Promise<void> => {
  let content: ContentShopLocations = {
    SHOP_LOCATIONS: shopLocations,
  };
  return writeFile(filePath, JSON.stringify(content));
};

const writeNamedSDETypeData = async (
  filePath: string,
  types: sdt.SDETypes,
  strs: sdt.Strs
): Promise<void> => {
  let content: ContentSdeTypes = {
    SDE_TYPE_DATA: types,
    STRS: strs,
  };
  return writeFile(filePath, JSON.stringify(content));
};
