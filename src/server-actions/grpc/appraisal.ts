import { ICharacter } from "@/browser/character";
import * as pb from "@/proto/etco";
import {
  BUYBACK_REGION_NAMES,
  BUYBACK_SYSTEMS,
} from "@/staticdata/buyback_systems";
import {
  SHOP_LOCATIONS,
  SHOP_REGION_NAMES,
  SHOP_SYSTEM_NAMES,
} from "@/staticdata/shop_locations";
import {
  BuybackAppraisalStatus,
  FullBuybackAppraisalStatus,
  FullShopAppraisalStatus,
  ShopAppraisalStatus,
} from "./appraisalStatus";
import { ShopLocation, System } from "@/staticdata/types";

export type NotBoolean<T> = T extends boolean ? never : T;

export type SameOrNew<T> = NotBoolean<T> | true;

export const newSameOrNew = <T>(
  a: NotBoolean<T>,
  b: NotBoolean<T> | undefined
): SameOrNew<T> => {
  if (b === undefined || a === b) {
    return true;
  } else {
    return b;
  }
};

export const typeVerify = <T>(t: T): T => t;

export interface AppraisalItemBase {
  typeId: number;
  name: string;
  pricePerUnit: number;
  newPricePerUnit: SameOrNew<number>;
  description: string;
  newDescription: SameOrNew<string>;
}

export interface AppraisalChildItem extends AppraisalItemBase {
  quantityPerParent: number;
  newQuantityPerParent: SameOrNew<number>;
}

export interface AppraisalItem extends AppraisalItemBase {
  quantity: number;
  contractQuantity: SameOrNew<number>;
  children: AppraisalChildItem[];
  unknown?: boolean;
}

type AppraisalItemMapped = Omit<AppraisalItem, "children"> & {
  children: Map<number, AppraisalChildItem>;
};

export interface BaseAppraisal {
  code: string;
  price: number;
  newPrice: SameOrNew<number>;
  time: number;
  newTime: SameOrNew<number>;
  version: string;
  newVersion: SameOrNew<string>;
  locationId: number | null;
  systemId: number;
  regionId: number;
  items: AppraisalItem[];
  locationNamingMaps: pb.LocationNamingMaps;
  character?: ICharacter;
}
export interface BuybackAppraisal extends BaseAppraisal {
  status: BuybackAppraisalStatus;
}
export interface ShopAppraisal extends BaseAppraisal {
  status: ShopAppraisalStatus;
}
export type Appraisal = BuybackAppraisal | ShopAppraisal;

// TODO: Clean this up, it's too long
export function toNewAppraisal(
  param: {
    kind: "buyback";
    appraisal: pb.BuybackAppraisal;
    newAppraisal?: pb.BuybackAppraisal;
    fullStatus?: FullBuybackAppraisalStatus;
  },
  character?: ICharacter | null,
  unknownItems?: pb.NamedBasicItem[]
): BuybackAppraisal;
export function toNewAppraisal(
  param: {
    kind: "shop";
    appraisal: pb.ShopAppraisal;
    newAppraisal?: pb.ShopAppraisal;
    fullStatus?: FullShopAppraisalStatus;
  },
  character?: ICharacter | null,
  unknownItems?: pb.NamedBasicItem[]
): ShopAppraisal;
export function toNewAppraisal(
  param:
    | {
        kind: "buyback";
        appraisal: pb.BuybackAppraisal;
        newAppraisal?: pb.BuybackAppraisal;
        fullStatus?: FullBuybackAppraisalStatus;
      }
    | {
        kind: "shop";
        appraisal: pb.ShopAppraisal;
        newAppraisal?: pb.ShopAppraisal;
        fullStatus?: FullShopAppraisalStatus;
      },
  character?: ICharacter | null,
  unknownItems?: pb.NamedBasicItem[]
): BuybackAppraisal | ShopAppraisal {
  let locationNamingMaps: pb.LocationNamingMaps;
  let locationId: number | null;
  let systemId: number;
  let regionId: number;
  let contractItems: pb.ContractItem[] | undefined;
  let status: BuybackAppraisalStatus | ShopAppraisalStatus;

  if (
    param.fullStatus === undefined ||
    param.fullStatus === null ||
    param.fullStatus === "inPurchaseQueue"
  ) {
    locationNamingMaps = {
      locationNames: {},
      systemNames: {},
      regionNames: {},
    };
    contractItems = undefined;
    status = param.fullStatus ?? null;
  } else {
    locationNamingMaps = param.fullStatus.locationNamingMaps;
    contractItems = param.fullStatus.contractItems;
    delete (param.fullStatus as any).locationNamingMaps;
    delete (param.fullStatus as any).contractItems;
    status = param.fullStatus;
  }

  if (param.kind === "buyback") {
    locationId = null;
    systemId = param.appraisal.systemId;
    const system = BUYBACK_SYSTEMS[systemId] as System | undefined;
    if (system === undefined) {
      regionId = -1;
      locationNamingMaps.systemNames[systemId] = "Unknown";
      locationNamingMaps.regionNames[regionId] = "Unknown";
    } else {
      regionId = system.regionId;
      locationNamingMaps.systemNames[systemId] = system.systemName;
      locationNamingMaps.regionNames[regionId] = BUYBACK_REGION_NAMES[regionId];
    }
  } /* kind === "shop" */ else {
    locationId = param.appraisal.locationId;
    const location = SHOP_LOCATIONS[locationId] as ShopLocation | undefined;
    if (location === undefined) {
      systemId = -1;
      regionId = -1;
      locationNamingMaps.locationNames[locationId] = "Unknown";
      locationNamingMaps.systemNames[systemId] = "Unknown";
      locationNamingMaps.regionNames[regionId] = "Unknown";
    } else {
      systemId = location.systemId;
      regionId = location.regionId;
      locationNamingMaps.locationNames[locationId] = location.locationName;
      locationNamingMaps.systemNames[systemId] = SHOP_SYSTEM_NAMES[systemId];
      locationNamingMaps.regionNames[regionId] = SHOP_REGION_NAMES[regionId];
    }
  }

  if (character === null) {
    character = undefined;
  } else if (character !== undefined) {
    character = { ...character, refreshToken: "" }; // redact refresh token
  }

  // undefined or greater than 0
  const newAppraisalTime =
    param.newAppraisal?.time !== undefined && param.newAppraisal?.time <= 0
      ? Date.now() / 1000
      : param.newAppraisal?.time;

  return {
    character,
    locationNamingMaps,
    locationId,
    systemId,
    regionId,
    status: status as any,
    code: param.appraisal.code,
    price: param.appraisal.price,
    newPrice: newSameOrNew(param.appraisal.price, param.newAppraisal?.price),
    time: param.appraisal.time,
    newTime: newSameOrNew(param.appraisal.time, newAppraisalTime),
    version: param.appraisal.version,
    newVersion: newSameOrNew(
      param.appraisal.version,
      param.newAppraisal?.version
    ),
    items: newAppraisalItems(
      {
        kind: param.kind as any,
        appraisalItems: param.appraisal.items,
        newAppraisalItems: param.newAppraisal?.items,
      },
      contractItems,
      unknownItems
    ),
  };
}

const newAppraisalItems = (
  param:
    | {
        kind: "buyback";
        appraisalItems: pb.BuybackParentItem[];
        newAppraisalItems?: pb.BuybackParentItem[];
      }
    | {
        kind: "shop";
        appraisalItems: pb.ShopItem[];
        newAppraisalItems?: pb.ShopItem[];
      },
  contractItems?: pb.ContractItem[],
  unknownItems?: pb.NamedBasicItem[]
): AppraisalItem[] => {
  const appraisalItemMap = new Map<number, AppraisalItemMapped>();

  for (const item of param.appraisalItems) {
    const childItems =
      param.kind === "buyback" ? (item as pb.BuybackParentItem).children : [];
    const children: Map<number, AppraisalChildItem> = new Map(
      (function* () {
        for (const childItem of childItems) {
          yield [
            childItem.typeId,
            {
              typeId: childItem.typeId,
              name: childItem.typeNamingIndexes?.name || "undefined",
              pricePerUnit: childItem.pricePerUnit,
              newPricePerUnit: true,
              description: childItem.description,
              newDescription: true,
              quantityPerParent: childItem.quantityPerParent,
              newQuantityPerParent: true,
            },
          ];
        }
      })()
    );
    appraisalItemMap.set(item.typeId, {
      typeId: item.typeId,
      name: item.typeNamingIndexes?.name || "undefined",
      pricePerUnit: item.pricePerUnit,
      newPricePerUnit: true,
      description: item.description,
      newDescription: true,
      quantity: item.quantity,
      contractQuantity: 0,
      children,
    });
  }

  for (const item of param.newAppraisalItems ?? []) {
    const appraisalItem = appraisalItemMap.get(item.typeId);
    if (appraisalItem === undefined) {
      console.warn(
        `newAppraisalItems has typeId ${item.typeId} but appraisalItems does not`
      );
      continue;
    }

    appraisalItem.newPricePerUnit = newSameOrNew(
      appraisalItem.pricePerUnit,
      item.pricePerUnit
    );
    appraisalItem.newDescription = newSameOrNew(
      appraisalItem.description,
      item.description
    );

    const childItems =
      param.kind === "buyback" ? (item as pb.BuybackParentItem).children : [];
    if (param.kind === "buyback") {
      for (const childItem of childItems) {
        const appraisalChildItem = appraisalItem.children.get(childItem.typeId);
        if (appraisalChildItem === undefined) {
          appraisalItem.children.set(childItem.typeId, {
            typeId: childItem.typeId,
            name: childItem.typeNamingIndexes?.name || "undefined",
            pricePerUnit: 0,
            newPricePerUnit: childItem.pricePerUnit,
            description: "",
            newDescription: childItem.description,
            quantityPerParent: 0,
            newQuantityPerParent: childItem.quantityPerParent,
          });
        } else {
          appraisalChildItem.newPricePerUnit = newSameOrNew(
            appraisalChildItem.pricePerUnit,
            childItem.pricePerUnit
          );
          appraisalChildItem.newDescription = newSameOrNew(
            appraisalChildItem.description,
            childItem.description
          );
          appraisalChildItem.newQuantityPerParent = newSameOrNew(
            appraisalChildItem.quantityPerParent,
            childItem.quantityPerParent
          );
        }
      }
    }
  }

  for (const item of contractItems ?? []) {
    const appraisalItem = appraisalItemMap.get(item.typeId);
    if (appraisalItem === undefined) {
      appraisalItemMap.set(item.typeId, {
        typeId: item.typeId,
        name: item.typeNamingIndexes?.name || "undefined",
        pricePerUnit: 0,
        newPricePerUnit: true,
        description: "",
        newDescription: true,
        quantity: 0,
        contractQuantity: item.quantity,
        children: new Map(),
      });
    } else {
      appraisalItem.contractQuantity = newSameOrNew(
        appraisalItem.quantity,
        item.quantity
      );
    }
  }

  return Array.from(
    (function* () {
      for (const appraisalItem of appraisalItemMap.values()) {
        (appraisalItem as unknown as AppraisalItem).children = Array.from(
          appraisalItem.children.values()
        );
        yield appraisalItem as unknown as AppraisalItem;
      }
      for (const unknownItem of unknownItems ?? []) {
        yield {
          typeId: 0,
          name: unknownItem.name,
          pricePerUnit: 0,
          newPricePerUnit: true,
          description: "",
          newDescription: true,
          quantity: unknownItem.quantity,
          contractQuantity: 0,
          children: [],
          unknown: true,
        };
      }
    })()
  );
};
