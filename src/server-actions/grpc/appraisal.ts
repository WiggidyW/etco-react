import { ICharacter } from "@/browser/character";
import * as pb from "@/proto/etco";
import { FullAppraisalStatus, AppraisalStatus } from "./appraisalStatus";
import { SameOrNew, newSameOrNew } from "@/components/todo";
import { StoreKind } from "./grpc";

export const TAX_TYPE_ID = -100;
export const FEE_TYPE_ID = -101;
export const UNKNOWN_TYPE_ID = -102;

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

export interface LocationInfo {
  locationId: number;
  locationStr: string;
  isStructure: boolean;
  forbiddenStructure: boolean;
  systemId: number;
  systemStr: string;
  regionId: number;
  regionStr: string;
}

export interface Appraisal {
  kind: StoreKind;
  code: string;
  price: number;
  newPrice: SameOrNew<number>;
  time: number;
  newTime: SameOrNew<number>;
  version: string;
  newVersion: SameOrNew<string>;
  locationInfo: LocationInfo;
  status: AppraisalStatus;
  items: AppraisalItem[];
  character?: ICharacter;
}

// TODO: Clean this up, it's too long
export function toNewAppraisal(
  param:
    | {
        kind: "buyback";
        appraisal: pb.BuybackAppraisal;
        newAppraisal?: pb.BuybackAppraisal;
      }
    | {
        kind: "shop";
        appraisal: pb.ShopAppraisal;
        newAppraisal?: pb.ShopAppraisal;
      },
  appraisalStrs: string[],
  newAppraisalStrs: string[],
  unknownItemStrs: string[],
  fullStatus?: FullAppraisalStatus,
  character?: ICharacter | null,
  unknownItems?: pb.NamedBasicItem[]
): Appraisal {
  let locationInfo: LocationInfo;
  let contractItems: pb.NamedBasicItem[] | undefined;
  let status: AppraisalStatus;

  if (
    fullStatus === undefined ||
    fullStatus === null ||
    fullStatus === "inPurchaseQueue"
  ) {
    contractItems = undefined;
    status = fullStatus ?? null;
  } else {
    contractItems = fullStatus.contractItems;
    delete (fullStatus as any).contractItems;
    status = fullStatus;
  }

  if (param.kind === "buyback") {
    const systemId = param.appraisal.systemInfo?.systemId ?? 0;
    const systemStr =
      appraisalStrs[param.appraisal.systemInfo?.systemStrIndex ?? 0];
    const regionId = param.appraisal.systemInfo?.regionId ?? 0;
    const regionStr =
      appraisalStrs[param.appraisal.systemInfo?.regionStrIndex ?? 0];
    locationInfo = {
      locationId: 0,
      locationStr: appraisalStrs[0],
      isStructure: false,
      forbiddenStructure: false,
      systemId,
      systemStr,
      regionId,
      regionStr,
    };
  } /* kind === "shop" */ else {
    const locationId = param.appraisal.locationInfo?.locationId ?? 0;
    const locationStr =
      appraisalStrs[param.appraisal.locationInfo?.locationStrIndex ?? 0];
    const isStructure = param.appraisal.locationInfo?.isStructure ?? false;
    const forbiddenStructure =
      param.appraisal.locationInfo?.forbiddenStructure ?? false;
    const systemId = param.appraisal.locationInfo?.systemInfo?.systemId ?? 0;
    const systemStr =
      appraisalStrs[
        param.appraisal.locationInfo?.systemInfo?.systemStrIndex ?? 0
      ];
    const regionId = param.appraisal.locationInfo?.systemInfo?.regionId ?? 0;
    const regionStr =
      appraisalStrs[
        param.appraisal.locationInfo?.systemInfo?.regionStrIndex ?? 0
      ];
    locationInfo = {
      locationId,
      locationStr,
      isStructure,
      forbiddenStructure,
      systemId,
      systemStr,
      regionId,
      regionStr,
    };
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
    kind: param.kind,
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
    locationInfo,
    status,
    items:
      param.kind === "buyback"
        ? newBuybackAppraisalItems(
            appraisalStrs,
            newAppraisalStrs,
            status !== null && status !== "inPurchaseQueue" ? status.strs : [],
            unknownItemStrs,
            param.appraisal,
            param.newAppraisal,
            contractItems,
            unknownItems
          )
        : newShopAppraisalItems(
            appraisalStrs,
            newAppraisalStrs,
            status !== null && status !== "inPurchaseQueue" ? status.strs : [],
            unknownItemStrs,
            param.appraisal,
            param.newAppraisal,
            contractItems,
            unknownItems
          ),
    character,
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

type SingleTypedItemData<T> = {
  item: T;
  strs: string[];
};

const newFeeItem = (
  fee: number,
  feePerM3: number
): SingleTypedItemData<pb.BuybackChildItem> => {
  const strs: string[] = ["M3 Fee", `${feePerM3} ISK/m3`];
  const item: pb.BuybackChildItem = {
    typeId: {
      typeId: FEE_TYPE_ID,
      typeStrIndex: 0,
      groupStrIndex: 0,
      categoryStrIndex: 0,
      marketGroupStrIndexes: [],
    },
    pricePerUnit: -fee,
    descriptionStrIndex: 1,
    quantityPerParent: 1,
  };
  return { item, strs };
};

const newTaxItem = (
  kind: AppraisalItemKind,
  tax: number,
  taxRate: number
):
  | SingleTypedItemData<pb.BuybackParentItem>
  | SingleTypedItemData<pb.ShopItem> => {
  const strs: string[] = ["Tax", `Remitted ${(taxRate * 100).toFixed(2)}% Tax`];
  const item: pb.ShopItem = {
    typeId: {
      typeId: TAX_TYPE_ID,
      typeStrIndex: 0,
      groupStrIndex: 0,
      categoryStrIndex: 0,
      marketGroupStrIndexes: [],
    },
    quantity: 1,
    pricePerUnit: tax === 0 ? 0 : kind === "shop" ? tax : -tax,
    descriptionStrIndex: 1,
  };
  if (kind === "shop") {
    return { item, strs };
  } else if (kind === "buyback_parent") {
    return {
      item: { ...item, children: [], feePerUnit: 0 } as pb.BuybackParentItem,
      strs,
    };
  } else {
    throw new Error(`newTaxItem: Invalid kind ${kind}`);
  }
};

// typed means same typeID - nothing to do with Programming Types
type TypedItemData<T> =
  | {
      oldItem: SingleTypedItemData<T> | null;
      newItem: SingleTypedItemData<T>;
      contractItem: SingleTypedItemData<pb.NamedBasicItem> | null;
      unknownItem: null;
    }
  | {
      oldItem: SingleTypedItemData<T>;
      newItem: SingleTypedItemData<T> | null;
      contractItem: SingleTypedItemData<pb.NamedBasicItem> | null;
      unknownItem: null;
    }
  | {
      oldItem: SingleTypedItemData<T> | null;
      newItem: SingleTypedItemData<T> | null;
      contractItem: SingleTypedItemData<pb.NamedBasicItem>;
      unknownItem: null;
    }
  | {
      oldItem: null;
      newItem: null;
      contractItem: null;
      unknownItem: SingleTypedItemData<pb.NamedBasicItem>;
    };

function iterAppraisalItems(
  kind: "buyback_parent",
  oldItems: pb.BuybackParentItem[],
  oldItemStrs: string[],
  newItems: pb.BuybackParentItem[],
  newItemStrs: string[],
  contractItems: pb.NamedBasicItem[],
  contractItemStrs: string[],
  unknownItems: pb.NamedBasicItem[],
  unknownItemStrs: string[],
  taxData: TaxData // always pass
): IterableIterator<TypedItemData<pb.BuybackParentItem>>;
function iterAppraisalItems(
  kind: "buyback_child",
  oldItems: pb.BuybackChildItem[],
  oldItemStrs: string[],
  newItems: pb.BuybackChildItem[],
  newItemStrs: string[],
  contractItems: never[],
  contractItemStrs: never[],
  unknownItems: never[],
  unknownItemStrs: never[],
  taxData: undefined,
  feeData: FeeData // always pass
): IterableIterator<TypedItemData<pb.BuybackChildItem>>;
function iterAppraisalItems(
  kind: "shop",
  oldItems: pb.ShopItem[],
  oldItemStrs: string[],
  newItems: pb.ShopItem[],
  newItemStrs: string[],
  contractItems: pb.NamedBasicItem[],
  contractItemStrs: string[],
  unknownItems: pb.NamedBasicItem[],
  unknownItemStrs: string[],
  taxData: TaxData // always pass
): IterableIterator<TypedItemData<pb.ShopItem>>;
function iterAppraisalItems(
  kind: AppraisalItemKind,
  oldItems: Item[],
  oldItemStrs: string[],
  newItems: Item[],
  newItemStrs: string[],
  contractItems: pb.NamedBasicItem[],
  contractItemStrs: string[],
  unknownItems: pb.NamedBasicItem[],
  unknownItemStrs: string[],
  taxData?: TaxData, // yielded if present AND either tax not 0
  feeData?: FeeData // yielded if present AND either fee not 0
): IterableIterator<TypedItemData<Item>> {
  return (function* () {
    // const oldItemsSorted = [...oldItems].sort((a, b) => a.typeId - b.typeId);
    // const newItemsSorted = [...newItems].sort((a, b) => a.typeId - b.typeId);

    // smallest typeid first
    oldItems.sort((a, b) => (a.typeId?.typeId || 0) - (b.typeId?.typeId || 0));
    newItems.sort((a, b) => (a.typeId?.typeId || 0) - (b.typeId?.typeId || 0));
    contractItems.sort(
      (a, b) => (a.typeId?.typeId || 0) - (b.typeId?.typeId || 0)
    );
    let oldIdx = 0;
    let newIdx = 0;
    let contractIdx = 0;

    // yield shared items between old, new, and contract, smallest typeId first
    while (true) {
      let oldItem: Item | null =
        oldIdx >= oldItems.length ? null : oldItems[oldIdx];
      let newItem: Item | null =
        newIdx >= newItems.length ? null : newItems[newIdx];
      let contractItem: pb.NamedBasicItem | null =
        contractIdx >= contractItems.length ? null : contractItems[contractIdx];

      if (oldItem === null && newItem === null && contractItem === null) {
        break; // exhausted
      }

      let smallestTypeId: number = Math.min(
        oldItem?.typeId?.typeId || Infinity,
        newItem?.typeId?.typeId || Infinity,
        contractItem?.typeId?.typeId || Infinity
      );

      if (oldItem?.typeId?.typeId !== smallestTypeId) oldItem = null;
      if (newItem?.typeId?.typeId !== smallestTypeId) newItem = null;
      if (contractItem?.typeId?.typeId !== smallestTypeId) contractItem = null;

      if (oldItem !== null) oldIdx++;
      if (newItem !== null) newIdx++;
      if (contractItem !== null) contractIdx++;

      yield {
        oldItem: oldItem
          ? {
              item: oldItem,
              strs: oldItemStrs,
            }
          : null,
        newItem: newItem
          ? {
              item: newItem,
              strs: newItemStrs,
            }
          : null,
        contractItem: contractItem
          ? {
              item: contractItem,
              strs: contractItemStrs,
            }
          : null,
        unknownItem: null,
      } as TypedItemData<Item>;
    }

    // yield all unknown items
    for (const unknownItem of unknownItems) {
      if (unknownItem.typeId !== undefined) {
        unknownItem.typeId.typeId = UNKNOWN_TYPE_ID;
      }
      yield {
        oldItem: null,
        newItem: null,
        contractItem: null,
        unknownItem: {
          item: unknownItem,
          strs: unknownItemStrs,
        },
      };
    }

    // maybe yield the tax
    if (taxData !== undefined) {
      const oldItem: SingleTypedItemData<Item> | null =
        taxData.oldTax > 0
          ? newTaxItem(kind, taxData.oldTax, taxData.oldTaxRate)
          : null;
      const newItem: SingleTypedItemData<Item> | null =
        taxData.newTax > 0
          ? newTaxItem(kind, taxData.newTax, taxData.newTaxRate)
          : null;
      if (oldItem !== null || newItem !== null) {
        yield {
          oldItem,
          newItem,
          contractItem: null,
          unknownItem: null,
        } as TypedItemData<Item>;
      }
    }

    // maybe yield the fee
    if (feeData !== undefined) {
      const oldItem: SingleTypedItemData<pb.BuybackChildItem> | null =
        feeData.oldFee > 0
          ? newFeeItem(feeData.oldFee, feeData.oldFeePerM3)
          : null;
      const newItem: SingleTypedItemData<pb.BuybackChildItem> | null =
        feeData.newFee > 0
          ? newFeeItem(feeData.newFee, feeData.newFeePerM3)
          : null;
      if (oldItem !== null || newItem !== null) {
        yield {
          oldItem,
          newItem,
          contractItem: null,
          unknownItem: null,
        } as TypedItemData<Item>;
      }
    }
  })();
}

function newAppraisalItemBase(
  items: TypedItemData<Item>,
  hasNewAppraisal: boolean
): AppraisalItemBase {
  let typeId: number;
  let name: string;
  if (items.oldItem !== null) {
    typeId = items.oldItem.item.typeId!.typeId;
    name = items.oldItem.strs[items.oldItem.item.typeId!.typeStrIndex];
  } else if (items.newItem !== null) {
    typeId = items.newItem.item.typeId!.typeId;
    name = items.newItem.strs[items.newItem.item.typeId!.typeStrIndex];
  } else if (items.contractItem !== null) {
    typeId = items.contractItem.item.typeId!.typeId;
    name =
      items.contractItem.strs[items.contractItem.item.typeId!.typeStrIndex];
  } else {
    typeId = items.unknownItem!.item.typeId!.typeId;
    name =
      items.unknownItem!.strs[items.unknownItem!.item.typeId!.typeStrIndex];
  }
  const pricePerUnit = items.oldItem?.item.pricePerUnit ?? 0;
  const newPricePerUnit = hasNewAppraisal
    ? newSameOrNew(pricePerUnit, items.newItem?.item.pricePerUnit)
    : true;
  const description = items.oldItem
    ? items.oldItem.strs[items.oldItem.item.descriptionStrIndex]
    : "N/A";
  const newDescription = hasNewAppraisal
    ? newSameOrNew(
        description,
        items.newItem
          ? items.newItem.strs[items.newItem.item.descriptionStrIndex]
          : "N/A"
      )
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
  items: TypedItemData<pb.ShopItem>,
  hasNewAppraisal: boolean,
  hasContract: boolean
): AppraisalItem;
function newAppraisalItem(
  items: TypedItemData<pb.BuybackParentItem>,
  hasNewAppraisal: boolean,
  hasContract: boolean,
  children: AppraisalChildItem[]
): AppraisalItem;
function newAppraisalItem(
  items: TypedItemData<pb.ShopItem> | TypedItemData<pb.BuybackParentItem>,
  hasNewAppraisal: boolean,
  hasContract: boolean,
  children?: AppraisalChildItem[]
): AppraisalItem {
  const quantity =
    items.oldItem?.item.quantity || items.newItem?.item.quantity || 0;
  const contractQuantity = hasContract
    ? newSameOrNew(quantity, items.contractItem?.item.quantity ?? 0)
    : true;
  return {
    ...newAppraisalItemBase(items, hasNewAppraisal),
    quantity,
    contractQuantity,
    children: children ?? [],
  };
}

function newAppraisalChildItem(
  items: TypedItemData<pb.BuybackChildItem>,
  hasNewAppraisal: boolean
): AppraisalChildItem {
  const quantityPerParent = items.oldItem?.item.quantityPerParent ?? 0;
  const newQuantityPerParent = hasNewAppraisal
    ? newSameOrNew(quantityPerParent, items.newItem?.item.quantityPerParent)
    : true;
  return {
    ...newAppraisalItemBase(items, hasNewAppraisal),
    quantityPerParent,
    newQuantityPerParent,
  };
}

function newShopAppraisalItems(
  appraisalStrs: string[],
  newAppraisalStrs: string[],
  statusStrs: string[],
  unknownItemStrs: string[],
  appraisal: pb.ShopAppraisal,
  newAppraisal?: pb.ShopAppraisal,
  contractItems?: pb.NamedBasicItem[],
  unknownItems?: pb.NamedBasicItem[]
): AppraisalItem[] {
  return Array.from(
    (function* () {
      for (const items of iterAppraisalItems(
        "shop",
        appraisal.items,
        appraisalStrs,
        newAppraisal?.items ?? [],
        newAppraisalStrs,
        contractItems ?? [],
        statusStrs,
        unknownItems ?? [],
        unknownItemStrs,
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
  appraisalStrs: string[],
  newAppraisalStrs: string[],
  statusStrs: string[],
  unknownItemStrs: string[],
  appraisal: pb.BuybackAppraisal,
  newAppraisal?: pb.BuybackAppraisal,
  contractItems?: pb.NamedBasicItem[],
  unknownItems?: pb.NamedBasicItem[]
): AppraisalItem[] {
  return Array.from(
    (function* () {
      for (const items of iterAppraisalItems(
        "buyback_parent",
        appraisal.items,
        appraisalStrs,
        newAppraisal?.items ?? [],
        newAppraisalStrs,
        contractItems ?? [],
        statusStrs,
        unknownItems ?? [],
        unknownItemStrs,
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
              items.oldItem?.item.children ?? [],
              appraisalStrs,
              items.newItem?.item.children ?? [],
              newAppraisalStrs,
              [],
              [],
              [],
              [],
              undefined,
              {
                oldFee: items.oldItem?.item.feePerUnit ?? 0,
                oldFeePerM3: appraisal.feePerM3,
                newFee: items.newItem?.item.feePerUnit ?? 0,
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
        if (items.oldItem)
          items.oldItem.item.pricePerUnit -= items.oldItem.item.feePerUnit;
        if (items.newItem)
          items.newItem.item.pricePerUnit -= items.newItem.item.feePerUnit;
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
