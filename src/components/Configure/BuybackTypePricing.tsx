"use client";

import { SelectAllableTable, TableTabs, rowClassName } from "../Table/Table";
import { Button, ManipulatorSelector, NumberInput } from "../Input/Manipulator";
import { PricingDesc, ReprocessingDesc } from "./description";
import { ReactElement, useMemo, useState } from "react";
import { ModificationState } from "./modificationState";
import { SDEType } from "@/staticdata/types";
import { ColumnType } from "antd/es/table";
import { ConfigureBase } from "./Base";
import classNames from "classnames";
import {
  SDE_TYPE_DATA,
  GROUP_NAMES,
  CATEGORY_NAMES,
  MARKET_GROUP_NAMES,
} from "@/staticdata/sde_types";
import {
  useSearchableCategoryColumn,
  useSearchableGroupColumn,
  useSearchableMarketGroupColumn,
  useSearchableTypeNameColumn,
  MarketPricingDescColumn,
  BuybackPricingKindColumn,
  ReprocessingDescColumn,
} from "../Table/Column";
import {
  CfgBuybackSystemTypeBundle,
  CfgBuybackTypePricing,
  CfgTypePricing,
} from "@/proto/etco";
import { resultCfgGetBuybackSystemTypeMapsBuilderLoad } from "@/server-actions/grpc/cfgGet";
import { resultCfgMergeBuybackSystemTypeMapsBuilder } from "@/server-actions/grpc/cfgMerge";

export interface ConfigureBuybackTypePricingProps {
  refreshToken: string;
  undoCap?: number;
  redoCap?: number;
}
export const ConfigureBuybackTypePricing = ({
  refreshToken,
  undoCap,
  redoCap,
}: ConfigureBuybackTypePricingProps): ReactElement => (
  <ConfigureBase
    initial={{}}
    refreshToken={refreshToken}
    actionLoad={resultCfgGetBuybackSystemTypeMapsBuilderLoad}
    actionMerge={resultCfgMergeBuybackSystemTypeMapsBuilder}
    deepClone={deepCloneBuilder}
    mergeUpdates={mergeBuilder}
    undoCap={undoCap}
    redoCap={redoCap}
  >
    {({ update, updated, rep: { builder, bundleKeys, marketNames } }) => (
      <Configure
        update={update}
        oldBuilder={builder}
        newBuilder={updated}
        bundleKeys={bundleKeys}
        marketNames={marketNames}
      />
    )}
  </ConfigureBase>
);

const deepCloneBuilder = (builder: {
  [key: number]: CfgBuybackSystemTypeBundle;
}): { [key: number]: CfgBuybackSystemTypeBundle } => {
  const clone: { [key: number]: CfgBuybackSystemTypeBundle } = {};
  for (const [typeId, bundle] of Object.entries(builder)) {
    clone[Number(typeId)] = deepCloneBundle(bundle);
  }
  return clone;
};
const deepCloneBundle = (
  bundle: CfgBuybackSystemTypeBundle
): CfgBuybackSystemTypeBundle => {
  const clone: CfgBuybackSystemTypeBundle = { inner: {} };
  for (const [bundleKey, pricing] of Object.entries(bundle.inner)) {
    clone.inner[bundleKey] = deepClonePricing(pricing);
  }
  return clone;
};
const deepClonePricing = ({
  pricing: marketPricing,
  reprocessingEfficiency,
}: CfgBuybackTypePricing): CfgBuybackTypePricing => ({
  pricing: marketPricing ? { ...marketPricing } : undefined,
  reprocessingEfficiency,
});

const mergeBuilder = (
  builder: { [key: number]: CfgBuybackSystemTypeBundle },
  updates: { [key: number]: CfgBuybackSystemTypeBundle }
): void => {
  for (const [typeId, bundle] of Object.entries(updates)) {
    const existingBundle = builder[Number(typeId)];
    if (existingBundle === undefined) {
      builder[Number(typeId)] = bundle;
    } else {
      mergeBundle(existingBundle, bundle);
    }
  }
};
const mergeBundle = (
  bundle: CfgBuybackSystemTypeBundle,
  update: CfgBuybackSystemTypeBundle
): void => {
  for (const [bundleKey, pricing] of Object.entries(update.inner)) {
    bundle.inner[bundleKey] = pricing;
  }
};

const EMPTY: CfgBuybackTypePricing = {
  pricing: undefined,
  reprocessingEfficiency: 0,
};

class RecordData {
  newBundles: { [key: number]: CfgBuybackSystemTypeBundle } = {};
  bundleKey: string | null = null;

  constructor(
    readonly sdeTypes: SDEType[],
    readonly sdeGroupNames: string[],
    readonly sdeCategoryNames: string[],
    readonly sdeMarketGroupNames: string[],
    readonly oldBundles: { [key: number]: CfgBuybackSystemTypeBundle }
  ) {}

  newRecords(): Record[] {
    return this.sdeTypes.map((type) => new Record(this, type));
  }
}

class Record {
  private _marketGroupNames: string[] | null = null;

  constructor(readonly recordData: RecordData, readonly sdeType: SDEType) {}

  private get oldBundle(): CfgBuybackSystemTypeBundle | undefined {
    return this.recordData.oldBundles[this.sdeType.typeId];
  }
  private get newBundle(): CfgBuybackSystemTypeBundle | undefined {
    return this.recordData.newBundles[this.sdeType.typeId];
  }
  private get oldPricing(): CfgBuybackTypePricing | undefined {
    if (this.recordData.bundleKey === null) return undefined;
    return this.oldBundle?.inner[this.recordData.bundleKey];
  }
  private get newPricing(): CfgBuybackTypePricing | undefined {
    if (this.recordData.bundleKey === null) return undefined;
    return this.newBundle?.inner[this.recordData.bundleKey];
  }

  get typeId(): number {
    return this.sdeType.typeId;
  }
  get typeName(): string {
    return this.sdeType.name;
  }
  get groupName(): string {
    return this.recordData.sdeGroupNames[this.sdeType.groupIndex];
  }
  get categoryName(): string {
    return this.recordData.sdeCategoryNames[this.sdeType.categoryIndex];
  }
  get marketGroupNames(): string[] {
    if (this._marketGroupNames === null) {
      this._marketGroupNames = this.sdeType.marketGroupIndexes.map(
        (index) => this.recordData.sdeMarketGroupNames[index]
      );
    }
    return this._marketGroupNames;
  }

  get oldReprEff(): number | undefined {
    return this.oldPricing?.reprocessingEfficiency;
  }
  get newReprEff(): number | undefined {
    return this.newPricing?.reprocessingEfficiency;
  }
  get reprEff(): number | undefined {
    return this.newReprEff ?? this.oldReprEff;
  }

  get oldMarketPricing(): CfgTypePricing | undefined {
    return this.oldPricing?.pricing;
  }
  get newMarketPricing(): CfgTypePricing | undefined {
    return this.newPricing?.pricing;
  }
  get marketPricing(): CfgTypePricing | undefined {
    const newPricing = this.newPricing;
    // if this is undefined, it means it's been deleted. so return it.
    if (newPricing !== undefined) return newPricing.pricing;
    return this.oldMarketPricing;
  }

  get rowKey(): number {
    return this.typeId;
  }

  getModificationState(): ModificationState {
    // typeid->bundle                     doesn't exist
    // typeid->bundle->bundlekey->pricing doesn't exist
    if (this.newPricing === undefined) return ModificationState.Unmodified;
    // typeid->bundle->bundlekey->pricing         exists
    else {
      // pricing is zeroed out
      if (this.newReprEff === 0 && this.newMarketPricing === undefined)
        return ModificationState.Deleted;
      // pricing is not zeroed out
      return ModificationState.Modified;
    }
  }
}

interface ConfigureProps {
  update: (updates: { [key: number]: CfgBuybackSystemTypeBundle }) => void;
  oldBuilder: { [key: number]: CfgBuybackSystemTypeBundle };
  newBuilder: { [key: number]: CfgBuybackSystemTypeBundle };
  bundleKeys: Set<string>;
  marketNames: string[];
}
const Configure = ({
  update,
  oldBuilder,
  newBuilder,
  bundleKeys,
  marketNames,
}: ConfigureProps): ReactElement => {
  const [selectedBundleKey, setSelectedBundleKey] = useState<string | null>(
    null
  );
  const [selectedRecords, setSelectedRecords] = useState<Record[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const updates = useMemo<{ [key: number]: CfgBuybackSystemTypeBundle }>(
    () => ({}),
    [newBuilder]
  );
  const recordData = useMemo(
    () =>
      new RecordData(
        SDE_TYPE_DATA,
        GROUP_NAMES,
        CATEGORY_NAMES,
        MARKET_GROUP_NAMES,
        oldBuilder
      ),
    [oldBuilder]
  );
  recordData.bundleKey = selectedBundleKey;
  recordData.newBundles = newBuilder;
  const records = useMemo(() => recordData.newRecords(), [recordData]);

  const updateSelected = (typePricing: CfgBuybackTypePricing) => {
    if (selectedBundleKey === null) {
      throw new Error("updateSelected: selectedBundleKey is null");
    }
    for (const typeId of selectedRowKeys) {
      const bundle = updates[typeId];
      if (bundle === undefined) {
        updates[typeId] = { inner: { [selectedBundleKey]: typePricing } };
      } else {
        bundle.inner[selectedBundleKey] = typePricing;
      }
    }
    update(updates);
  };

  const deleteSelected = () => {
    if (selectedBundleKey === null) {
      throw new Error("deleteSelected: selectedBundleKey is null");
    }
    updateSelected(EMPTY);
  };

  return (
    <div className={classNames("inline-block", "p-4", "min-w-full")}>
      <Manipulator
        anySelected={selectedRecords.length > 0}
        marketNames={marketNames}
        onSave={updateSelected}
        onDelete={deleteSelected}
      />
      <Table
        records={records}
        bundleKeys={bundleKeys}
        selectedBundleKey={selectedBundleKey}
        selectedRecords={selectedRecords}
        selectedRowKeys={selectedRowKeys}
        setSelected={(records, rowKeys) => {
          setSelectedRecords(records);
          setSelectedRowKeys(rowKeys);
        }}
        setSelectedBundleKey={setSelectedBundleKey}
      />
    </div>
  );
};

interface ManipulatorProps {
  anySelected: boolean;
  marketNames: string[];
  onSave: (typePricing: CfgBuybackTypePricing) => void;
  onDelete: () => void;
}
const Manipulator = ({
  anySelected,
  marketNames,
  onSave,
  onDelete,
}: ManipulatorProps): ReactElement => {
  const [market, setMarket] = useState<string | null>(null); //
  const [isBuy, setIsBuy] = useState<boolean | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null); // 0-100
  const [modifier, setModifier] = useState<number | null>(null); // 1-255
  const [reprEff, setReprEff] = useState<number | null>(null); // 1-100

  const isBuyValid = isBuy !== null;
  const percentileValid =
    percentile !== null && percentile >= 0 && percentile <= 100;
  const modifierValid = modifier !== null && modifier >= 1 && modifier <= 255;
  const marketValid = market !== null && market !== "";

  const pricingValid =
    isBuyValid && percentileValid && modifierValid && marketValid;
  const reprEffValid = reprEff !== null && reprEff >= 1 && reprEff <= 100;

  const savePossible = pricingValid || reprEffValid;

  const pricing = pricingValid
    ? { isBuy, percentile, modifier, market }
    : undefined;
  const reprocessingEfficiency = reprEffValid ? reprEff : 0;

  let description: string | null;
  if (pricingValid && reprEffValid) {
    description = `${PricingDesc(pricing!)} + ${ReprocessingDesc(reprEff!)}`;
  } else if (pricingValid) {
    description = PricingDesc(pricing!);
  } else if (reprEffValid) {
    description = ReprocessingDesc(reprEff!);
  } else {
    description = null;
  }

  return (
    <>
      {/* Manipulator */}
      <div
        className={classNames(
          "w-full",
          "flex",
          "items-end",
          "space-x-4"
          // "pb-4"
        )}
      >
        <span className={classNames("flex-grow")} />

        {/* Market Selection */}
        <ManipulatorSelector
          options={marketNames}
          title="Select Market"
          selected={market}
          setSelected={setMarket}
        />

        {/* Modifier Input */}
        <NumberInput
          min={1}
          max={255}
          title="Modifier"
          value={modifier}
          setValue={setModifier}
        />

        {/* Percentile Input */}
        <NumberInput
          min={0}
          max={100}
          title="Percentile"
          value={percentile}
          setValue={setPercentile}
        />

        {/* Buy/Sell Selection */}
        <ManipulatorSelector
          options={["Buy Orders", "Sell Orders"]}
          title="Select Order Type"
          selected={(() => {
            switch (isBuy) {
              case true:
                return "Buy Orders";
              case false:
                return "Sell Orders";
              case null:
                return null;
            }
          })()}
          setSelected={(selected) => {
            switch (selected) {
              case null:
                return setIsBuy(null);
              case "Buy Orders":
                return setIsBuy(true);
              case "Sell Orders":
                return setIsBuy(false);
            }
          }}
        />

        {/* ReprEff Input */}
        <NumberInput
          min={1}
          max={100}
          title="Reprocessing Efficiency"
          value={reprEff}
          setValue={setReprEff}
        />

        {/* Delete Button */}
        <Button variant="failure" disabled={!anySelected} onClick={onDelete}>
          Delete
        </Button>

        {/* Save Button */}
        <Button
          variant="success"
          disabled={!savePossible || !anySelected}
          onClick={() =>
            savePossible && onSave({ pricing, reprocessingEfficiency })
          }
        >
          Save
        </Button>

        <span className={classNames("flex-grow")} />
      </div>

      {/* Description */}
      {description ? (
        <div
          className={classNames(
            "w-full",
            "flex",
            "justify-center",
            "mt-2",
            "mb-1",
            "text-lg",
            "font-bold"
          )}
        >
          {description}
        </div>
      ) : (
        <div className={classNames("h-4")} />
      )}
    </>
  );
};

interface TableProps {
  selectedBundleKey: string | null;
  setSelectedBundleKey: (selected: string | null) => void;
  selectedRecords: Record[];
  selectedRowKeys: number[];
  setSelected: (records: Record[], rowKeys: number[]) => void;
  records: Record[];
  bundleKeys: Set<string>;
}
const Table = ({
  bundleKeys,
  selectedBundleKey,
  setSelectedBundleKey,
  selectedRecords,
  selectedRowKeys,
  setSelected,
  records,
}: TableProps): ReactElement => {
  const [newBundleKeys, setNewBundleKeys] = useState<Set<string>>(new Set());
  const columns: ColumnType<Record>[] = [
    useSearchableTypeNameColumn(),
    BuybackPricingKindColumn(),
    MarketPricingDescColumn(),
    ReprocessingDescColumn(),
    useSearchableGroupColumn(),
    useSearchableCategoryColumn(),
    useSearchableMarketGroupColumn("text-xs-fixme"),
  ];
  return (
    <>
      <TableTabs
        oldTabs={bundleKeys}
        newTabs={newBundleKeys}
        selectedTab={selectedBundleKey}
        setSelectedTab={setSelectedBundleKey}
        addTab={(tab) => {
          setNewBundleKeys(new Set(newBundleKeys).add(tab));
          setSelectedBundleKey(tab);
        }}
      />
      <SelectAllableTable
        className={classNames("whitespace-nowrap")}
        dataSource={records}
        selectedRecords={selectedRecords}
        selectedRowKeys={selectedRowKeys}
        setSelected={setSelected}
        empty={selectedBundleKey === null}
        rowClassName={(record) => rowClassName(record)}
        columns={columns}
      />
    </>
  );
};
