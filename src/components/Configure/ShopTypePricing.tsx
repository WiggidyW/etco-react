"use client";

import { ReactElement, useMemo, useState } from "react";
import { ColumnType } from "antd/es/table";
import { SDEType } from "@/proto/staticdata/types";
import { ModificationState } from "./modificationState";
import {
  CfgShopLocationTypeBundle,
  CfgShopTypePricing,
  CfgTypePricing,
} from "@/proto/etco";
import {
  useSearchableCategoryColumn,
  useSearchableGroupColumn,
  useSearchableMarketGroupColumn,
  useSearchableTypeNameColumn,
  MarketPricingDescColumn,
} from "../Table/Column";
import { SelectAllableTable, TableTabs, rowClassName } from "../Table/Table";
import classNames from "classnames";
import { Button, ManipulatorSelector, NumberInput } from "../Input/Manipulator";
import { PricingDesc } from "./description";
import {
  SDE_TYPE_DATA,
  GROUP_NAMES,
  CATEGORY_NAMES,
  MARKET_GROUP_NAMES,
} from "@/proto/staticdata/sde_types";
import { ConfigureBase } from "./Base";
import { resultCfgGetShopLocationTypeMapsBuilderLoad } from "@/server-actions/grpc/cfgGet";
import { resultCfgMergeShopLocationTypeMapsBuilder } from "@/server-actions/grpc/cfgMerge";

export interface ConfigureShopTypePricingProps {
  refreshToken: string;
  undoCap?: number;
  redoCap?: number;
}
export const ConfigureShopTypePricing = ({
  refreshToken,
  undoCap,
  redoCap,
}: ConfigureShopTypePricingProps): ReactElement => (
  <ConfigureBase
    initial={{}}
    refreshToken={refreshToken}
    actionLoad={resultCfgGetShopLocationTypeMapsBuilderLoad}
    actionMerge={resultCfgMergeShopLocationTypeMapsBuilder}
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
  [key: number]: CfgShopLocationTypeBundle;
}): { [key: number]: CfgShopLocationTypeBundle } => {
  const clone: { [key: number]: CfgShopLocationTypeBundle } = {};
  for (const [typeId, bundle] of Object.entries(builder)) {
    clone[Number(typeId)] = deepCloneBundle(bundle);
  }
  return clone;
};
const deepCloneBundle = (
  bundle: CfgShopLocationTypeBundle
): CfgShopLocationTypeBundle => {
  const clone: CfgShopLocationTypeBundle = { inner: {} };
  for (const [bundleKey, pricing] of Object.entries(bundle.inner)) {
    clone.inner[bundleKey] = deepClonePricing(pricing);
  }
  return clone;
};
const deepClonePricing = ({
  inner: marketPricing,
}: CfgShopTypePricing): CfgShopTypePricing => ({
  inner: marketPricing ? { ...marketPricing } : undefined,
});

const mergeBuilder = (
  builder: { [key: number]: CfgShopLocationTypeBundle },
  updates: { [key: number]: CfgShopLocationTypeBundle }
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
  bundle: CfgShopLocationTypeBundle,
  update: CfgShopLocationTypeBundle
): void => {
  for (const [bundleKey, pricing] of Object.entries(update.inner)) {
    bundle.inner[bundleKey] = pricing;
  }
};

const EMPTY: CfgShopTypePricing = {
  inner: undefined,
};

class RecordData {
  newBundles: { [key: number]: CfgShopLocationTypeBundle } = {};
  bundleKey: string | null = null;

  constructor(
    readonly sdeTypes: SDEType[],
    readonly sdeGroupNames: string[],
    readonly sdeCategoryNames: string[],
    readonly sdeMarketGroupNames: string[],
    readonly oldBundles: { [key: number]: CfgShopLocationTypeBundle }
  ) {}

  newRecords(): Record[] {
    return this.sdeTypes.map((type) => new Record(this, type));
  }
}

class Record {
  private _marketGroupNames: string[] | null = null;

  constructor(readonly recordData: RecordData, readonly sdeType: SDEType) {}

  private get oldBundle(): CfgShopLocationTypeBundle | undefined {
    return this.recordData.oldBundles[this.sdeType.typeId];
  }
  private get newBundle(): CfgShopLocationTypeBundle | undefined {
    return this.recordData.newBundles[this.sdeType.typeId];
  }
  private get oldPricing(): CfgShopTypePricing | undefined {
    if (this.recordData.bundleKey === null) return undefined;
    return this.oldBundle?.inner[this.recordData.bundleKey];
  }
  private get newPricing(): CfgShopTypePricing | undefined {
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

  get oldMarketPricing(): CfgTypePricing | undefined {
    return this.oldPricing?.inner;
  }
  get newMarketPricing(): CfgTypePricing | undefined {
    return this.newPricing?.inner;
  }
  get marketPricing(): CfgTypePricing | undefined {
    const newPricing = this.newPricing;
    // if this is undefined, it means it's been deleted. so return it.
    if (newPricing !== undefined) return newPricing.inner;
    return this.oldMarketPricing;
  }

  get rowKey(): number {
    return this.typeId;
  }

  getModificationState(): ModificationState {
    if (this.newPricing === undefined) {
      return ModificationState.Unmodified;
    } else if (this.newMarketPricing === undefined) {
      return ModificationState.Deleted;
    } else {
      return ModificationState.Modified;
    }
  }
}

interface ConfigureProps {
  update: (updates: { [key: number]: CfgShopLocationTypeBundle }) => void;
  oldBuilder: { [key: number]: CfgShopLocationTypeBundle };
  newBuilder: { [key: number]: CfgShopLocationTypeBundle };
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
  const updates = useMemo<{ [key: number]: CfgShopLocationTypeBundle }>(
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

  const updateSelected = (typePricing: CfgShopTypePricing) => {
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
    <>
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
    </>
  );
};

interface ManipulatorProps {
  anySelected: boolean;
  marketNames: string[];
  onSave: (typePricing: CfgShopTypePricing) => void;
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

  const isBuyValid = isBuy !== null;
  const percentileValid =
    percentile !== null && percentile >= 0 && percentile <= 100;
  const modifierValid = modifier !== null && modifier >= 1 && modifier <= 255;
  const marketValid = market !== null && market !== "";

  const pricingValid =
    isBuyValid && percentileValid && modifierValid && marketValid;

  const savePossible = pricingValid;

  const pricing = pricingValid
    ? { isBuy, percentile, modifier, market }
    : undefined;

  const description: string | null = pricingValid
    ? PricingDesc(pricing!)
    : null;

  return (
    <>
      {/* Manipulator */}
      <div className={classNames("w-full", "flex", "items-end", "space-x-4")}>
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

        {/* Delete Button */}
        <Button variant="failure" disabled={!anySelected} onClick={onDelete}>
          Delete
        </Button>

        {/* Save Button */}
        <Button
          variant="success"
          disabled={!savePossible || !anySelected}
          onClick={() => savePossible && onSave({ inner: pricing })}
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
    MarketPricingDescColumn(),
    useSearchableGroupColumn(),
    useSearchableCategoryColumn(),
    useSearchableMarketGroupColumn("text-xs"),
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
