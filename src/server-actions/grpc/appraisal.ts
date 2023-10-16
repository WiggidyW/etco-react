import { ShopLocation, System } from "@/staticdata/types";
import { ICharacter } from "@/browser/character";
import * as pb from "@/proto/etco";
import {
  BuybackAppraisalStatus,
  FullBuybackAppraisalStatus,
  FullShopAppraisalStatus,
  ShopAppraisalStatus,
} from "./appraisalStatus";

import buyback_systems_json from "@/staticdata/buyback_systems.json";
import { ContentBuybackSystems } from "@/staticdata/buyback_systems";
import shop_locations_json from "@/staticdata/shop_locations.json";
import { ContentShopLocations } from "@/staticdata/shop_locations";
const { BUYBACK_REGION_NAMES, BUYBACK_SYSTEMS }: ContentBuybackSystems =
  buyback_systems_json;
const {
  SHOP_LOCATIONS,
  SHOP_REGION_NAMES,
  SHOP_SYSTEM_NAMES,
}: ContentShopLocations = shop_locations_json;

export const TAX_TYPE_ID = -100;
export const FEE_TYPE_ID = -101;

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
    items:
      param.kind === "buyback"
        ? newBuybackAppraisalItems(
            param.appraisal,
            param.newAppraisal,
            contractItems,
            unknownItems
          )
        : newShopAppraisalItems(
            param.appraisal,
            param.newAppraisal,
            contractItems,
            unknownItems
          ),
  };
}

type AppraisalItemKind = "buyback_parent" | "buyback_child" | "shop";
type Item = pb.BuybackParentItem | pb.BuybackChildItem | pb.ShopItem;
type FeeData = {
  oldFee: number;
  oldFeePerM3: number;
  newFee: number;
  newFeePerM3: number;
};
type TaxData = {
  oldTax: number;
  oldTaxRate: number;
  newTax: number;
  newTaxRate: number;
};

const newFeeItem = (fee: number, feePerM3: number): pb.BuybackChildItem => ({
  typeId: FEE_TYPE_ID,
  pricePerUnit: -fee,
  description: `${feePerM3} ISK/m3`,
  quantityPerParent: 1,
  typeNamingIndexes: {
    name: "M3 Fee",
    groupIndex: -1,
    categoryIndex: -1,
    marketGroupIndexes: [],
  },
});

const newTaxItem = (
  kind: AppraisalItemKind,
  tax: number,
  taxRate: number
): pb.BuybackParentItem | pb.ShopItem => {
  const BaseItem: pb.ShopItem = {
    typeId: TAX_TYPE_ID,
    quantity: 1,
    pricePerUnit: kind === "shop" ? tax : -tax,
    description: `Remitted ${(taxRate * 100).toFixed(2)}% Tax`,
    typeNamingIndexes: {
      name: "Tax",
      groupIndex: -1,
      categoryIndex: -1,
      marketGroupIndexes: [],
    },
  };
  if (kind === "shop") {
    return BaseItem;
  } else if (kind === "buyback_parent") {
    return {
      ...BaseItem,
      children: [],
      feePerUnit: 0,
    } as pb.BuybackParentItem;
  } else {
    throw new Error(`newTaxItem: Invalid kind ${kind}`);
  }
};

type TypedItemsMinOne<T> =
  | {
      oldItem: T | null;
      newItem: T;
      contractItem: pb.ContractItem | null;
      unknownItem: null;
    }
  | {
      oldItem: T;
      newItem: T | null;
      contractItem: pb.ContractItem | null;
      unknownItem: null;
    }
  | {
      oldItem: T | null;
      newItem: T | null;
      contractItem: pb.ContractItem;
      unknownItem: null;
    }
  | {
      oldItem: null;
      newItem: null;
      contractItem: null;
      unknownItem: pb.NamedBasicItem;
    };

function iterAppraisalItems(
  kind: "buyback_parent",
  oldItems: pb.BuybackParentItem[],
  newItems: pb.BuybackParentItem[],
  contractItems: pb.ContractItem[],
  unknownItems: pb.NamedBasicItem[],
  taxData: TaxData // always pass
): IterableIterator<TypedItemsMinOne<pb.BuybackParentItem>>;
function iterAppraisalItems(
  kind: "buyback_child",
  oldItems: pb.BuybackChildItem[],
  newItems: pb.BuybackChildItem[],
  contractItems: never[],
  unknownItems: never[],
  taxData: undefined,
  feeData: FeeData // always pass
): IterableIterator<TypedItemsMinOne<pb.BuybackChildItem>>;
function iterAppraisalItems(
  kind: "shop",
  oldItems: pb.ShopItem[],
  newItems: pb.ShopItem[],
  contractItems: pb.ContractItem[],
  unknownItems: pb.NamedBasicItem[],
  taxData: TaxData // always pass
): IterableIterator<TypedItemsMinOne<pb.ShopItem>>;
function iterAppraisalItems(
  kind: AppraisalItemKind,
  oldItems: Item[],
  newItems: Item[],
  contractItems: pb.ContractItem[],
  unknownItems: pb.NamedBasicItem[],
  taxData?: TaxData, // yielded if present AND either tax not 0
  feeData?: FeeData // yielded if present AND either fee not 0
): IterableIterator<TypedItemsMinOne<Item>> {
  return (function* () {
    // const oldItemsSorted = [...oldItems].sort((a, b) => a.typeId - b.typeId);
    // const newItemsSorted = [...newItems].sort((a, b) => a.typeId - b.typeId);

    // smallest typeid first
    oldItems.sort((a, b) => a.typeId - b.typeId);
    newItems.sort((a, b) => a.typeId - b.typeId);
    contractItems.sort((a, b) => a.typeId - b.typeId);
    let oldIdx = 0;
    let newIdx = 0;
    let contractIdx = 0;

    // yield shared items between old, new, and contract, smallest typeId first
    while (true) {
      let oldItem: Item | null =
        oldIdx >= oldItems.length ? null : oldItems[oldIdx];
      let newItem: Item | null =
        newIdx >= newItems.length ? null : newItems[newIdx];
      let contractItem: pb.ContractItem | null =
        contractIdx >= contractItems.length ? null : contractItems[contractIdx];

      if (oldItem === null && newItem === null && contractItem === null) {
        break; // exhausted
      }

      let smallestTypeId: number = Math.min(
        oldItem?.typeId ?? Infinity,
        newItem?.typeId ?? Infinity,
        contractItem?.typeId ?? Infinity
      );

      if (oldItem?.typeId !== smallestTypeId) oldItem = null;
      if (newItem?.typeId !== smallestTypeId) newItem = null;
      if (contractItem?.typeId !== smallestTypeId) contractItem = null;

      if (oldItem !== null) oldIdx++;
      if (newItem !== null) newIdx++;
      if (contractItem !== null) contractIdx++;

      yield {
        oldItem,
        newItem,
        contractItem,
        unknownItem: null,
      } as TypedItemsMinOne<Item>;
    }

    // yield all unknown items
    for (const unknownItem of unknownItems) {
      yield { oldItem: null, newItem: null, contractItem: null, unknownItem };
    }

    // maybe yield the tax
    if (taxData !== undefined) {
      const oldItem: Item | null =
        taxData.oldTax > 0
          ? newTaxItem(kind, taxData.oldTax, taxData.oldTaxRate)
          : null;
      const newItem: Item | null =
        taxData.newTax > 0
          ? newTaxItem(kind, taxData.newTax, taxData.newTaxRate)
          : null;
      if (oldItem !== null || newItem !== null) {
        yield {
          oldItem,
          newItem,
          contractItem: null,
          unknownItem: null,
        } as TypedItemsMinOne<Item>;
      }
    }

    // maybe yield the fee
    if (feeData !== undefined) {
      const oldItem: pb.BuybackChildItem | null =
        feeData.oldFee > 0
          ? newFeeItem(feeData.oldFee, feeData.oldFeePerM3)
          : null;
      const newItem: pb.BuybackChildItem | null =
        feeData.newFee > 0
          ? newFeeItem(feeData.newFee, feeData.newFeePerM3)
          : null;
      if (oldItem !== null || newItem !== null) {
        yield {
          oldItem,
          newItem,
          contractItem: null,
          unknownItem: null,
        } as TypedItemsMinOne<Item>;
      }
    }
  })();
}

function newAppraisalItemBase(
  items: TypedItemsMinOne<Item>,
  hasNewAppraisal: boolean
): AppraisalItemBase {
  let typeId: number;
  let name: string;
  if (items.oldItem !== null) {
    typeId = items.oldItem.typeId;
    name = items.oldItem.typeNamingIndexes!.name;
  } else if (items.newItem !== null) {
    typeId = items.newItem.typeId;
    name = items.newItem.typeNamingIndexes!.name;
  } else if (items.contractItem !== null) {
    typeId = items.contractItem.typeId;
    name = items.contractItem.typeNamingIndexes!.name;
  } else {
    typeId = items.unknownItem.typeId;
    name = items.unknownItem.name;
  }
  const pricePerUnit = items.oldItem?.pricePerUnit ?? 0;
  const newPricePerUnit = hasNewAppraisal
    ? newSameOrNew(pricePerUnit, items.newItem?.pricePerUnit)
    : true;
  const description = items.oldItem?.description ?? "N/A";
  const newDescription = hasNewAppraisal
    ? newSameOrNew(description, items.newItem?.description)
    : true;
  return {
    typeId,
    name,
    pricePerUnit,
    newPricePerUnit,
    description,
    newDescription,
  };
}

function newAppraisalItem(
  items: TypedItemsMinOne<pb.ShopItem>,
  hasNewAppraisal: boolean,
  hasContract: boolean
): AppraisalItem;
function newAppraisalItem(
  items: TypedItemsMinOne<pb.BuybackParentItem>,
  hasNewAppraisal: boolean,
  hasContract: boolean,
  children: AppraisalChildItem[]
): AppraisalItem;
function newAppraisalItem(
  items: TypedItemsMinOne<pb.ShopItem> | TypedItemsMinOne<pb.BuybackParentItem>,
  hasNewAppraisal: boolean,
  hasContract: boolean,
  children?: AppraisalChildItem[]
): AppraisalItem {
  const quantity = items.oldItem?.quantity ?? 0;
  const contractQuantity = hasContract
    ? newSameOrNew(quantity, items.contractItem?.quantity ?? 0)
    : true;
  return {
    ...newAppraisalItemBase(items, hasNewAppraisal),
    quantity,
    contractQuantity,
    children: children ?? [],
  };
}

function newAppraisalChildItem(
  items: TypedItemsMinOne<pb.BuybackChildItem>,
  hasNewAppraisal: boolean
): AppraisalChildItem {
  const quantityPerParent = items.oldItem?.quantityPerParent ?? 0;
  const newQuantityPerParent = hasNewAppraisal
    ? newSameOrNew(quantityPerParent, items.newItem?.quantityPerParent)
    : true;
  return {
    ...newAppraisalItemBase(items, hasNewAppraisal),
    quantityPerParent,
    newQuantityPerParent,
  };
}

function newShopAppraisalItems(
  appraisal: pb.ShopAppraisal,
  newAppraisal?: pb.ShopAppraisal,
  contractItems?: pb.ContractItem[],
  unknownItems?: pb.NamedBasicItem[]
): AppraisalItem[] {
  return Array.from(
    (function* () {
      for (const items of iterAppraisalItems(
        "shop",
        appraisal.items,
        newAppraisal?.items ?? [],
        contractItems ?? [],
        unknownItems ?? [],
        {
          oldTax: appraisal.tax,
          oldTaxRate: appraisal.taxRate,
          newTax: newAppraisal?.tax ?? 0,
          newTaxRate: newAppraisal?.taxRate ?? 0,
        }
      )) {
        yield newAppraisalItem(
          items,
          newAppraisal !== undefined,
          contractItems !== undefined
        );
      }
    })()
  );
}

function newBuybackAppraisalItems(
  appraisal: pb.BuybackAppraisal,
  newAppraisal?: pb.BuybackAppraisal,
  contractItems?: pb.ContractItem[],
  unknownItems?: pb.NamedBasicItem[]
): AppraisalItem[] {
  return Array.from(
    (function* () {
      for (const items of iterAppraisalItems(
        "buyback_parent",
        appraisal.items,
        newAppraisal?.items ?? [],
        contractItems ?? [],
        unknownItems ?? [],
        {
          oldTax: appraisal.tax,
          oldTaxRate: appraisal.taxRate,
          newTax: newAppraisal?.tax ?? 0,
          newTaxRate: newAppraisal?.taxRate ?? 0,
        }
      )) {
        const children = Array.from(
          (function* () {
            for (const childItems of iterAppraisalItems(
              "buyback_child",
              items.oldItem?.children ?? [],
              items.newItem?.children ?? [],
              [],
              [],
              undefined,
              {
                oldFee: items.oldItem?.feePerUnit ?? 0,
                oldFeePerM3: appraisal.feePerM3,
                newFee: items.newItem?.feePerUnit ?? 0,
                newFeePerM3: newAppraisal?.feePerM3 ?? 0,
              }
            )) {
              yield newAppraisalChildItem(
                childItems,
                newAppraisal !== undefined
              );
            }
          })()
        );
        yield newAppraisalItem(
          items,
          newAppraisal !== undefined,
          contractItems !== undefined,
          children
        );
      }
    })()
  );
}
