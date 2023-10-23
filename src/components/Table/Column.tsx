import { ColumnType } from "antd/es/table";
import { PricingDesc, ReprocessingDesc } from "../Configure/description";
import { LocaleText, formatPrice, formatQuantity } from "../Appraisal/Util";
import { TypeImage } from "../TypeImage";
import { NumberInput } from "../Input/Manipulator";
import classNames from "classnames";
import { Entity } from "@/browser/entity";
import { CharacterPortrait } from "../Character/Portrait";
import { useWithTextSearch } from "./useWithTextSearch";

// TODO: title parameters, className parameters

type OptionalField<O> = { [K in keyof O]?: O[K] | null };
type Optional<T> = T | null | undefined;

const sortOptional = <T,>(
  a: Optional<T>,
  b: Optional<T>,
  compare: (a: T, b: T) => number
): number => {
  if (a === undefined || a === null) {
    // a is None, b is None
    if (b === undefined || b === null) return 0;

    // a is None, b is Some
    return -1;
  } else if (b === undefined || b === null) {
    // a is Some, b is None
    return 1;

    // a is Some, b is Some
  } else {
    return compare(a, b);
  }
};

export const RefreshTokenColumn = <
  T extends OptionalField<{ refreshToken: string }>
>(
  className?: string
): ColumnType<T> => ({
  className,
  title: "Refresh Token",
  dataIndex: "refreshToken",
  key: "refreshToken",
  // render: undefined,
  sorter: (a, b) =>
    sortOptional(a.refreshToken, b.refreshToken, (aToken, bToken) =>
      aToken.localeCompare(bToken)
    ),
});

export const LocationIdColumn = <
  T extends OptionalField<{ locationId: number }>
>(
  className?: string
): ColumnType<T> => ({
  className,
  title: "Location ID",
  dataIndex: "locationId",
  key: "locationId",
  // render: undefined,
  sorter: (a, b) =>
    sortOptional(a.locationId, b.locationId, (aLoc, bLoc) =>
      Number(aLoc - bLoc)
    ),
});

export const LocationKindColumn = <
  T extends OptionalField<{ isStructure: boolean }>
>(
  className?: string
): ColumnType<T> => ({
  className,
  title: "Kind",
  dataIndex: "isStructure",
  key: "isStructure",
  render: (_, record) => {
    if (record.isStructure === undefined || record.isStructure === null) {
      return "";
    } else if (record.isStructure) {
      return "Structure";
    } else {
      return "Station";
    }
  },
  sorter: (a, b) =>
    sortOptional(
      a.isStructure,
      b.isStructure,
      (aIsStruc, bIsStruc) => (aIsStruc ? 1 : -1) - (bIsStruc ? 1 : -1)
    ),
});

export const M3FeeColumn = <T extends OptionalField<{ m3Fee: number }>>(
  className?: string
): ColumnType<T> => ({
  className,
  title: "M3 Fee",
  dataIndex: "m3Fee",
  key: "m3Fee",
  // render: undefined,
  sorter: (a, b) =>
    sortOptional(a.m3Fee, b.m3Fee, (aM3Fee, bM3Fee) => aM3Fee - bM3Fee),
});

export const useSearchableMarketNameColumn = <
  T extends OptionalField<{ marketName: string }>
>(
  className?: string
): ColumnType<T> =>
  useWithTextSearch(
    {
      className,
      title: "Name",
      dataIndex: "marketName",
      key: "marketName",
      // render: undefined,
      sorter: (a, b) =>
        sortOptional(a.marketName, b.marketName, (aMarketName, bMarketName) =>
          aMarketName.localeCompare(bMarketName)
        ),
    },
    (o, lowerCaseText) =>
      o.marketName?.toLowerCase().includes(lowerCaseText) || false
  );

export const useSearchableLocationColumn = <
  T extends OptionalField<{ locationName: string }>
>(
  className?: string
): ColumnType<T> =>
  useWithTextSearch(
    {
      className,
      title: "Location",
      dataIndex: "locationName",
      key: "locationName",
      // render: undefined,
      sorter: (a, b) =>
        sortOptional(
          a.locationName,
          b.locationName,
          (aLocationName, bLocationName) =>
            aLocationName.localeCompare(bLocationName)
        ),
    },
    (o, lowerCaseText) =>
      o.locationName?.toLowerCase().includes(lowerCaseText) || false
  );

export const useSearchableSystemColumn = <
  T extends OptionalField<{ systemName: string }>
>(
  className?: string
): ColumnType<T> =>
  useWithTextSearch(
    {
      className,
      title: "System",
      dataIndex: "systemName",
      key: "systemName",
      // render: undefined,
      sorter: (a, b) =>
        sortOptional(a.systemName, b.systemName, (aSystemName, bSystemName) =>
          aSystemName.localeCompare(bSystemName)
        ),
    },
    (o, lowerCaseText) =>
      o.systemName?.toLowerCase().includes(lowerCaseText) || false
  );

export const useSearchableRegionColumn = <
  T extends OptionalField<{ regionName: string }>
>(
  className?: string
): ColumnType<T> =>
  useWithTextSearch(
    {
      className,
      title: "Region",
      dataIndex: "regionName",
      key: "regionName",
      // render: undefined,
      sorter: (a, b) =>
        sortOptional(a.regionName, b.regionName, (aRegionName, bRegionName) =>
          aRegionName.localeCompare(bRegionName)
        ),
    },
    (o, lowerCaseText) =>
      o.regionName?.toLowerCase().includes(lowerCaseText) || false
  );

export const useSearchableTypeNameColumn = <
  T extends OptionalField<{ typeName: string; typeId: number }>
>(
  className?: string,
  image: boolean = false
): ColumnType<T> =>
  useWithTextSearch(
    {
      className,
      title: "Name",
      dataIndex: "typeName",
      key: "typeName",
      render: image
        ? (_, o) =>
            o.typeId ? (
              <div className={classNames("flex", "items-center")}>
                <TypeImage typeId={o.typeId} />
                {o.typeName}
              </div>
            ) : (
              <>{o.typeName}</>
            )
        : undefined,
      sorter: (a, b) =>
        sortOptional(a.typeName, b.typeName, (aTypeName, bTypeName) =>
          aTypeName.localeCompare(bTypeName)
        ),
    },
    (o, lowerCaseText) =>
      o.typeName?.toLowerCase().includes(lowerCaseText) || false
  );

export const useSearchableGroupColumn = <
  T extends OptionalField<{ groupName: string }>
>(
  className?: string
): ColumnType<T> =>
  useWithTextSearch(
    {
      className,
      title: "Group",
      dataIndex: "groupName",
      key: "groupName",
      // render: undefined,
      sorter: (a, b) =>
        sortOptional(a.groupName, b.groupName, (aGroupName, bGroupName) =>
          aGroupName.localeCompare(bGroupName)
        ),
    },
    (o, lowerCaseText) =>
      o.groupName?.toLowerCase().includes(lowerCaseText) || false
  );

export const useSearchableCategoryColumn = <
  T extends OptionalField<{ categoryName: string }>
>(
  className?: string
): ColumnType<T> =>
  useWithTextSearch(
    {
      className,
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      // render: undefined,
      sorter: (a, b) =>
        sortOptional(
          a.categoryName,
          b.categoryName,
          (aCategoryName, bCategoryName) =>
            aCategoryName.localeCompare(bCategoryName)
        ),
    },
    (o, lowerCaseText) =>
      o.categoryName?.toLowerCase().includes(lowerCaseText) || false
  );

export const useSearchableMarketGroupColumn = <
  T extends OptionalField<{ marketGroupNames: string[] }>
>(
  className?: string,
  maxDepth?: number
): ColumnType<T> =>
  useWithTextSearch(
    {
      className,
      title: "Market Groups",
      dataIndex: "marketGroupNames",
      key: "marketGroupNames",
      render: maxDepth
        ? (_, o) =>
            o.marketGroupNames
              ?.slice(0, Math.min(maxDepth, o.marketGroupNames.length))
              .join(" \\ ") || ""
        : (_, o) => o.marketGroupNames?.join(" \\ ") || "",
      sorter: (a, b) =>
        sortOptional(
          a.marketGroupNames,
          b.marketGroupNames,
          // _ TODO _
          // compare by individual strings,
          // starting at the end string of each, comparing until they differ
          // compare the index of the longer array to the final index of the shorter array
          // until the indexes are equal
          // ^ TODO ^
          (aMarketGroupNames, bMarketGroupNames) =>
            aMarketGroupNames
              .join(" \\ ")
              .localeCompare(bMarketGroupNames.join(" \\ "))
        ),
    },
    (o, lowerCaseText) =>
      o.marketGroupNames?.some((s) =>
        s.toLowerCase().includes(lowerCaseText)
      ) || false
  );

export const useSearchableBannedFlagsColumn = <
  T extends OptionalField<{ bannedFlags: string[] }>
>(
  className?: string
): ColumnType<T> =>
  useWithTextSearch(
    {
      className,
      title: "Banned Flags",
      dataIndex: "bannedFlags",
      key: "bannedFlags",
      render: (_, o) => o.bannedFlags?.length || "",
      sorter: (a, b) =>
        sortOptional(
          a.bannedFlags,
          b.bannedFlags,
          (aBannedFlags, bBannedFlags) =>
            aBannedFlags.join(" \\ ").localeCompare(bBannedFlags.join(" \\ "))
        ),
    },
    (o, lowerCaseText) =>
      o.bannedFlags?.some((s) => s.toLowerCase().includes(lowerCaseText)) ||
      false
  );

export const QuantityColumn = <T extends { quantity: number }>(
  className?: string,
  title: string = "Quantity"
): ColumnType<T> => ({
  className,
  title,
  dataIndex: "quantity",
  key: "quantity",
  render: (_, o) => <LocaleText fmt={formatQuantity} v={o.quantity} />,
  sorter: (a, b) => a.quantity - b.quantity,
});

export const DescriptionColumn = <T extends { description: string }>(
  className?: string,
  title: string = "Description"
): ColumnType<T> => ({
  className,
  title,
  dataIndex: "description",
  key: "description",
  // render: undefined,
  sorter: (a, b) => a.description.localeCompare(b.description),
});

export const PricePerUnitColumn = <T extends { pricePerUnit: number }>(
  className?: string,
  title: string = "PricePer"
): ColumnType<T> => ({
  className,
  title,
  dataIndex: "pricePerUnit",
  key: "pricePerUnit",
  render: (_, o) => <LocaleText fmt={formatPrice} v={o.pricePerUnit} />,
  sorter: (a, b) => a.pricePerUnit - b.pricePerUnit,
});

export const ReprocessingDescColumn = <
  T extends OptionalField<{ reprEff: number }>
>(
  className?: string
): ColumnType<T> => ({
  className,
  title: "Reprocessed Pricing",
  dataIndex: "reprEff",
  key: "reprEff",
  render: (_, o) => (o.reprEff ? ReprocessingDesc(o.reprEff) : ""),
  sorter: (a, b) =>
    sortOptional(
      a.reprEff,
      b.reprEff,
      (aReprEff, bReprEff) => aReprEff - bReprEff
    ),
});

export const KindFmtColumn = <T extends OptionalField<{ kindFmt: string }>>(
  className?: string
): ColumnType<T> => ({
  className,
  title: "Kind",
  dataIndex: "kindFmt",
  key: "kindFmt",
  // render: undefined,
  sorter: (a, b) =>
    sortOptional(a.kindFmt, b.kindFmt, (aKind, bKind) =>
      aKind.localeCompare(bKind)
    ),
});

export const BannedFmtColumn = <T extends OptionalField<{ bannedFmt: string }>>(
  className?: string
): ColumnType<T> => ({
  className,
  title: "Status",
  dataIndex: "bannedFmt",
  key: "bannedFmt",
  // render: undefined,
  sorter: (a, b) =>
    sortOptional(a.bannedFmt, b.bannedFmt, (aBanned, bBanned) =>
      aBanned.localeCompare(bBanned)
    ),
});

export const EntityNameColumn = <
  T extends OptionalField<{ entity: Entity; name: string; ticker: string }>
>(
  className?: string
): ColumnType<T> => ({
  className,
  title: "Name",
  dataIndex: "entity",
  key: "entity",
  render: (_, o) =>
    (o.entity || o.name) && (
      <div className={classNames("flex", "items-center")}>
        {o.entity && (
          <CharacterPortrait
            character={o.entity}
            className={classNames("mr-1")}
            size="md"
          />
        )}
        {o.name && (o.ticker ? `[${o.ticker}] ${o.name}` : o.name)}
      </div>
    ),
});

export const IdColumn = <T extends { id: number }>(
  className?: string,
  title: string = "ID"
): ColumnType<T> => ({
  className,
  title,
  dataIndex: "id",
  key: "id",
  // render: undefined,
  sorter: (a, b) => a.id - b.id,
});

export const TaxRateColumn = <T extends OptionalField<{ taxRate: number }>>(
  className?: string
): ColumnType<T> => ({
  className,
  title: "Tax Rate",
  dataIndex: "taxRate",
  key: "taxRate",
  render: (_, o) =>
    o.taxRate !== null && o.taxRate !== undefined
      ? `${(o.taxRate * 100).toFixed(2)}%`
      : undefined,
  sorter: (a, b) =>
    sortOptional(
      a.taxRate,
      b.taxRate,
      (aTaxRate, bTaxRate) => aTaxRate - bTaxRate
    ),
});

export const useSearchableBundleKeyColumn = <
  T extends OptionalField<{ bundleKey: string }>
>(
  className?: string,
  title: string = "Bundle Key"
): ColumnType<T> =>
  useWithTextSearch(
    {
      className,
      title,
      dataIndex: "bundleKey",
      key: "bundleKey",
      // render: undefined,
      sorter: (a, b) =>
        sortOptional(a.bundleKey, b.bundleKey, (aBundleKey, bBundleKey) =>
          aBundleKey.localeCompare(bBundleKey)
        ),
    },
    (o, lowerCaseText) =>
      o.bundleKey?.toLowerCase().includes(lowerCaseText) || false
  );

export const BuybackPricingKindColumn = <
  T extends OptionalField<{
    reprEff: number;
    marketPricing: {
      isBuy: boolean;
      percentile: number;
      modifier: number;
      market: string;
    };
  }>
>(
  className?: string
): ColumnType<T> => {
  type BuybackPricingKind =
    | ""
    | "Reprocessed"
    | "Market"
    | "Market + Reprocessed";

  const BuybackPricingKindSortVal: { [key in BuybackPricingKind]: number } = {
    [""]: 0,
    ["Reprocessed"]: 1,
    ["Market"]: 2,
    ["Market + Reprocessed"]: 3,
  };

  const getBuybackPricingKind = (o: T): BuybackPricingKind => {
    if (o.reprEff === null || o.reprEff === undefined || o.reprEff === 0) {
      if (o.marketPricing === null || o.marketPricing === undefined) return "";
      return "Market";
    } else if (o.marketPricing === null || o.marketPricing === undefined) {
      return "Reprocessed";
    } else {
      return "Market + Reprocessed";
    }
  };

  return {
    className,
    title: "Pricing Kind",
    // dataIndex: undefined,
    key: "pricingKind",
    render: (_, record) => getBuybackPricingKind(record),
    sorter: (a, b) =>
      BuybackPricingKindSortVal[getBuybackPricingKind(a)] -
      BuybackPricingKindSortVal[getBuybackPricingKind(b)],
  };
};

export const MarketPricingDescColumn = <
  T extends OptionalField<{
    marketPricing: {
      isBuy: boolean;
      percentile: number;
      modifier: number;
      market: string;
    };
  }>
>(
  className?: string
): ColumnType<T> => ({
  className,
  title: "Market Pricing",
  dataIndex: "marketPricing",
  key: "marketPricing",
  render: (_, o) => (o.marketPricing ? PricingDesc(o.marketPricing) : ""),
  sorter: (a, b) =>
    sortOptional(
      a.marketPricing,
      b.marketPricing,
      (aMarketPricing, bMarketPricing) =>
        compareMarketPricing(aMarketPricing, bMarketPricing)
    ),
});

export const RowKeyStringColumn = <T extends { rowKey: string }>(
  className?: string,
  title: string = "Row Key"
): ColumnType<T> => ({
  className,
  title,
  dataIndex: "rowKey",
  key: "rowKey",
  // render: undefined,
  sorter: (a, b) => a.rowKey.localeCompare(b.rowKey),
});

export const CartColumn = <
  T extends OptionalField<{ quantity: number; cartQuantity: number }>
>(
  setCartQuantity: (record: T, quantity: number | null) => void,
  className?: string
): ColumnType<T> => ({
  className,
  title: "Cart",
  dataIndex: "cartQuantity",
  key: "cartQuantity",
  render: (_, o) =>
    o.quantity && (
      <NumberInput
        min={0}
        max={o.quantity}
        value={o.cartQuantity ?? null}
        setValue={(v: number | null) => setCartQuantity(o, v)}
        noPad
        addMaxButton
        clearButton
        inputClassName={classNames("w-24")}
      />
    ),
  sorter: (a, b) =>
    sortOptional(
      a.cartQuantity,
      b.cartQuantity,
      (aCartQuantity, bCartQuantity) => aCartQuantity - bCartQuantity
    ),
});

const compareMarketPricing = (
  a: { isBuy: boolean; percentile: number; modifier: number; market: string },
  b: { isBuy: boolean; percentile: number; modifier: number; market: string }
): number => {
  // 1. try compare by isBuy
  if (a.isBuy !== b.isBuy) return a.isBuy ? 1 : -1;
  // 2. try compare by market
  if (a.market !== b.market) return a.market.localeCompare(b.market);
  // 3. try compare by percentile
  if (a.percentile !== b.percentile) return a.percentile - b.percentile;
  // 4. compare by modifier
  return a.modifier - b.modifier;
};
