"use client";

import { ReactElement, useMemo, useState } from "react";
import { ColumnType } from "antd/es/table";
import {
  Systems as SDESystems,
  System as SDESystem,
  RegionNames as SDERegionNames,
} from "@/staticdata/types";
import { ModificationState } from "./modificationState";
import { CfgBuybackSystem } from "@/proto/etco";
import {
  useSearchableSystemColumn,
  useSearchableRegionColumn,
  M3FeeColumn,
  useSearchableBundleKeyColumn,
  TaxRateColumn,
} from "../Table/Column";
import { SelectAllableTable, rowClassName } from "../Table/Table";
import classNames from "classnames";
import { SDE_REGION_NAMES, SDE_SYSTEMS } from "@/staticdata/sde_systems";
import { Button, ManipulatorSelector, NumberInput } from "../Input/Manipulator";
import { ConfigureBase } from "./Base";
import { resultCfgGetBuybackSystemsLoad } from "@/server-actions/grpc/cfgGet";
import { resultCfgMergeBuybackSystems } from "@/server-actions/grpc/cfgMerge";

export interface ConfigureBuybackSystemsProps {
  refreshToken: string;
  undoCap?: number;
  redoCap?: number;
}
export const ConfigureBuybackSystems = ({
  refreshToken,
  undoCap,
  redoCap,
}: ConfigureBuybackSystemsProps): ReactElement => (
  <ConfigureBase
    initial={{}}
    refreshToken={refreshToken}
    actionLoad={resultCfgGetBuybackSystemsLoad}
    actionMerge={resultCfgMergeBuybackSystems}
    deepClone={deepCloneSystems}
    mergeUpdates={mergeSystems}
    undoCap={undoCap}
    redoCap={redoCap}
  >
    {({ update, updated, rep: { systems, bundleKeys } }) => (
      <Configure
        update={update}
        oldSystems={systems}
        newSystems={updated}
        bundleKeys={bundleKeys}
      />
    )}
  </ConfigureBase>
);

const deepCloneSystems = (systems: {
  [systemId: number]: CfgBuybackSystem;
}): { [systemId: number]: CfgBuybackSystem } => {
  const clone: { [systemId: number]: CfgBuybackSystem } = {};
  for (const [systemId, system] of Object.entries(systems)) {
    clone[Number(systemId)] = deepCloneSystem(system);
  }
  return clone;
};
const deepCloneSystem = (system: CfgBuybackSystem): CfgBuybackSystem => ({
  ...system,
});

const mergeSystems = (
  systems: { [systemId: number]: CfgBuybackSystem },
  updates: { [systemId: number]: CfgBuybackSystem }
): void => {
  for (const [systemId, update] of Object.entries(updates)) {
    systems[Number(systemId)] = update;
  }
};

const EMPTY: CfgBuybackSystem = {
  bundleKey: "",
  taxRate: 0,
  m3Fee: 0,
};

class RecordData {
  newSystems: { [systemId: number]: CfgBuybackSystem } = {};

  constructor(
    readonly oldSystems: { [systemId: number]: CfgBuybackSystem },
    readonly sdeSystems: SDESystems,
    readonly regionNames: SDERegionNames
  ) {}

  newRecords(): Record[] {
    return Object.keys(this.sdeSystems).map(
      (systemId) => new Record(this, Number(systemId))
    );
  }
}

class Record {
  constructor(readonly recordData: RecordData, readonly systemId: number) {}

  private get oldSystem(): CfgBuybackSystem | undefined {
    return this.recordData.oldSystems[this.systemId];
  }
  private get newSystem(): CfgBuybackSystem | undefined {
    return this.recordData.newSystems[this.systemId];
  }
  private get system(): CfgBuybackSystem | undefined {
    return this.newSystem ?? this.oldSystem;
  }
  private get sdeSystem(): SDESystem {
    return this.recordData.sdeSystems[this.systemId];
  }

  get systemName(): string {
    return this.sdeSystem.systemName;
  }
  get regionName(): string {
    return this.recordData.regionNames[this.sdeSystem.regionId];
  }
  get m3Fee(): number | undefined {
    return this.system?.m3Fee;
  }
  get bundleKey(): string | undefined {
    return this.system?.bundleKey;
  }
  get taxRate(): number | undefined {
    return this.system?.taxRate;
  }

  get rowKey(): number {
    return this.systemId;
  }

  getModificationState(): ModificationState {
    if (this.newSystem === undefined) return ModificationState.Unmodified;
    else {
      if (
        this.newSystem.bundleKey === "" &&
        this.newSystem.m3Fee === 0 &&
        this.newSystem.taxRate === 0
      )
        return ModificationState.Deleted;
      return ModificationState.Modified;
    }
  }
}

interface ConfigureProps {
  update: (updates: { [systemId: number]: CfgBuybackSystem }) => void;
  oldSystems: { [marketName: string]: CfgBuybackSystem };
  newSystems: { [marketName: string]: CfgBuybackSystem };
  bundleKeys: string[];
}
const Configure = ({
  update,
  oldSystems,
  newSystems,
  bundleKeys,
}: ConfigureProps): ReactElement => {
  const [selected, setSelected] = useState<{
    records: Record[];
    rowKeys: number[];
  }>({
    records: [],
    rowKeys: [],
  });
  const updates = useMemo<{ [systemId: number]: CfgBuybackSystem }>(
    () => ({}),
    [newSystems]
  );
  const recordData = useMemo(
    () => new RecordData(oldSystems, SDE_SYSTEMS, SDE_REGION_NAMES),
    [oldSystems]
  );
  recordData.newSystems = newSystems;
  const records = useMemo(() => recordData.newRecords(), [recordData]);

  const updateSelected = (cfgSystem: CfgBuybackSystem) => {
    for (const systemId of selected.rowKeys) {
      updates[systemId] = cfgSystem;
    }
    update(updates);
  };

  const deleteSelected = () => updateSelected(EMPTY);

  return (
    <div className={classNames("inline-block", "p-4", "min-w-full")}>
      <Manipulator
        anySelected={selected.rowKeys.length > 0}
        bundleKeys={bundleKeys}
        onSave={updateSelected}
        onDelete={deleteSelected}
      />
      <div className={classNames("h-4")} />
      <Table records={records} selected={selected} setSelected={setSelected} />
    </div>
  );
};

interface ManipulatorProps {
  anySelected: boolean;
  bundleKeys: string[];
  onSave: (cfgSystem: CfgBuybackSystem) => void;
  onDelete: () => void;
}
const Manipulator = ({
  anySelected,
  bundleKeys,
  onSave,
  onDelete,
}: ManipulatorProps): ReactElement => {
  const [m3Fee, setM3Fee] = useState<number | null>(null);
  const [bundleKey, setBundleKey] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState<number | null>(null);

  const bundleKeyValid = bundleKey !== null && bundleKey !== "";
  const m3FeeValid = m3Fee === null || m3Fee >= 0;
  const taxRateValid = taxRate === null || (taxRate >= 0 && taxRate <= 100);

  const savePossible = bundleKeyValid && m3FeeValid && taxRateValid;

  return (
    <div className={classNames("w-full", "flex", "items-end", "space-x-4")}>
      <span className={classNames("flex-grow")} />

      {/* Bundle Key Selection */}
      <ManipulatorSelector
        options={bundleKeys}
        title="Select Template"
        selected={bundleKey}
        setSelected={setBundleKey}
      />

      {/* Tax Rate Input */}
      <NumberInput
        min={0}
        max={100}
        title="Tax Rate"
        value={taxRate}
        setValue={(n: number | null) => setTaxRate(n)}
      />

      {/* M3 Fee Input */}
      <NumberInput
        min={0}
        max={Number.MAX_SAFE_INTEGER}
        title="M3 Fee"
        value={m3Fee}
        setValue={setM3Fee}
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
          savePossible &&
          onSave({
            bundleKey,
            taxRate: taxRate ? taxRate / 100 : 0,
            m3Fee: m3Fee ?? 0,
          })
        }
      >
        {anySelected ? "Save" : "Add"}
      </Button>

      <span className={classNames("flex-grow")} />
    </div>
  );
};

interface TableProps {
  records: Record[];
  selected: { records: Record[]; rowKeys: number[] };
  setSelected: (selected: { records: Record[]; rowKeys: number[] }) => void;
}
const Table = ({
  records,
  selected,
  setSelected,
}: TableProps): ReactElement => {
  const columns: ColumnType<Record>[] = [
    useSearchableSystemColumn(),
    useSearchableRegionColumn(),
    useSearchableBundleKeyColumn(undefined, "Template"),
    TaxRateColumn(),
    M3FeeColumn(),
  ];
  return (
    <SelectAllableTable
      dataSource={records}
      selectedRecords={selected.records}
      selectedRowKeys={selected.rowKeys}
      setSelected={(records, rowKeys) => setSelected({ records, rowKeys })}
      rowClassName={(record) => rowClassName(record)}
      columns={columns}
    />
  );
};
