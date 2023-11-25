"use client";

import { ReactElement, useMemo, useState } from "react";
import { ColumnType } from "antd/es/table";
import { ModificationState } from "./modificationState";
import { CfgShopLocation, LocationInfo } from "@/proto/etco";
import {
  useSearchableSystemColumn,
  useSearchableRegionColumn,
  useSearchableBundleKeyColumn,
  useSearchableLocationColumn,
  useSearchableBannedFlagsColumn,
  LocationKindColumn,
  LocationIdColumn,
  TaxRateColumn,
} from "../Table/Column";
import { SelectAllableTable, rowClassName } from "../Table/Table";
import classNames from "classnames";
import { Button, ManipulatorSelector, NumberInput } from "../Input/Manipulator";
import { ConfigureBase } from "./Base";
import {
  LOCATION_MAX,
  LOCATION_MIN,
  isLocationIdValid,
} from "../../utils/locationId";
import { ContentPortal } from "../Content";
import { Popup } from "../Popup";
import { BannedFlagsSelector } from "./BannedFlagSelector";
import { resultCfgGetShopLocationsLoad } from "@/server-actions/grpc/cfgGet";
import { resultCfgMergeShopLocations } from "@/server-actions/grpc/cfgMerge";

type Locations = { [locationId: number]: CfgShopLocation };

export interface ConfigureShopLocationsProps {
  refreshToken: string;
  undoCap?: number;
  redoCap?: number;
}
export const ConfigureShopLocations = ({
  refreshToken,
  undoCap,
  redoCap,
}: ConfigureShopLocationsProps): ReactElement => (
  <ConfigureBase
    initial={{}}
    refreshToken={refreshToken}
    actionLoad={resultCfgGetShopLocationsLoad}
    actionMerge={resultCfgMergeShopLocations}
    deepClone={deepCloneLocations}
    mergeUpdates={mergeLocations}
    undoCap={undoCap}
    redoCap={redoCap}
  >
    {({
      update,
      updated,
      rep: { locations, locationInfoMap, strs, bundleKeys },
    }) => (
      <Configure
        update={update}
        oldLocations={locations}
        newLocations={updated}
        locationInfoMap={locationInfoMap}
        strs={strs}
        bundleKeys={bundleKeys}
      />
    )}
  </ConfigureBase>
);

const deepCloneLocations = (locations: Locations) => {
  const clone: Locations = {};
  for (const [locationId, location] of Object.entries(locations)) {
    clone[Number(locationId)] = deepCloneLocation(location);
  }
  return clone;
};

const deepCloneLocation = (location: CfgShopLocation): CfgShopLocation => ({
  ...location,
});

const mergeLocations = (locations: Locations, updates: Locations): void => {
  for (const [locationId, update] of Object.entries(updates)) {
    locations[Number(locationId)] = update;
  }
};

const EMPTY: CfgShopLocation = {
  bundleKey: "",
  taxRate: 0,
  bannedFlags: [],
};

class RecordData {
  newLocations: Locations = {};

  constructor(
    readonly oldLocations: Locations,
    readonly locationInfoMap: { [locationId: string]: LocationInfo },
    readonly strs: string[]
  ) {}

  newRecords(): Record[] {
    const uniqueLocationIds = new Set<number>();
    for (const locationId in this.oldLocations) {
      uniqueLocationIds.add(Number(locationId));
    }
    for (const locationId in this.newLocations) {
      uniqueLocationIds.add(Number(locationId));
    }
    return [...uniqueLocationIds].map(
      (locationId) => new Record(this, locationId)
    );
  }
}

class Record {
  constructor(readonly recordData: RecordData, readonly locationId: number) {}

  private get oldLocation(): CfgShopLocation | undefined {
    return this.recordData.oldLocations[this.locationId];
  }
  private get newLocation(): CfgShopLocation | undefined {
    return this.recordData.newLocations[this.locationId];
  }
  private get location(): CfgShopLocation | undefined {
    return this.newLocation ?? this.oldLocation;
  }
  private get locationInfo(): LocationInfo | undefined {
    return this.recordData.locationInfoMap[this.locationId.toString()];
  }

  get forbiddenStructure(): boolean | undefined {
    return this.locationInfo?.forbiddenStructure;
  }
  get isStructure(): boolean | undefined {
    return this.locationInfo?.isStructure;
  }
  get locationName(): string | undefined {
    return this.recordData.strs[this.locationInfo?.locationStrIndex ?? 0];
  }
  get systemId(): number | undefined {
    return this.locationInfo?.systemInfo?.systemId;
  }
  get systemName(): string | undefined {
    if (this.systemId)
      return this.recordData.strs[
        this.locationInfo?.systemInfo?.systemStrIndex ?? 0
      ];
  }
  get regionId(): number | undefined {
    return this.locationInfo?.systemInfo?.regionId;
  }
  get regionName(): string | undefined {
    if (this.regionId)
      return this.recordData.strs[
        this.locationInfo?.systemInfo?.regionStrIndex ?? 0
      ];
  }
  get bundleKey(): string | undefined {
    return this.location?.bundleKey;
  }
  get bannedFlags(): string[] | undefined {
    return this.location?.bannedFlags;
  }
  get taxRate(): number | undefined {
    return this.location?.taxRate;
  }

  get rowKey(): number {
    return this.locationId;
  }

  getModificationState(): ModificationState {
    if (this.newLocation === undefined) return ModificationState.Unmodified;
    if (
      this.newLocation.bundleKey === "" &&
      this.newLocation.bannedFlags?.length === 0 &&
      this.newLocation.taxRate === 0
    )
      return ModificationState.Deleted;
    return ModificationState.Modified;
  }
}

interface ConfigureProps {
  update: (updates: Locations) => void;
  oldLocations: Locations;
  newLocations: Locations;
  locationInfoMap: { [locationId: string]: LocationInfo };
  strs: string[];
  bundleKeys: string[];
}
const Configure = ({
  update,
  oldLocations,
  newLocations,
  locationInfoMap,
  strs,
  bundleKeys,
}: ConfigureProps): ReactElement => {
  const [selected, setSelected] = useState<{
    records: Record[];
    rowKeys: number[];
  }>({
    records: [],
    rowKeys: [],
  });
  const updates = useMemo<Locations>(() => ({}), [newLocations]);
  const recordData = useMemo(
    () => new RecordData(oldLocations, locationInfoMap, strs),
    [oldLocations, locationInfoMap, strs]
  );
  recordData.newLocations = newLocations;
  const records = useMemo(
    () => recordData.newRecords(),
    [recordData, newLocations]
  );

  const updateSelected = (location: CfgShopLocation) => {
    for (const locationId of selected.rowKeys) {
      updates[locationId] = location;
    }
    update(updates);
  };

  const addNew = (locationId: number, location: CfgShopLocation) => {
    updates[locationId] = location;
    update(updates);
  };

  const deleteSelected = () => updateSelected(EMPTY);

  return (
    <div className={classNames("inline-block", "p-4", "min-w-full")}>
      <Manipulator
        selectedRecords={selected.records}
        bundleKeys={bundleKeys}
        onSave={updateSelected}
        addNew={addNew}
        onDelete={deleteSelected}
      />
      <div className={classNames("h-4")} />
      <Table records={records} selected={selected} setSelected={setSelected} />
    </div>
  );
};

interface ManipulatorProps {
  selectedRecords: Record[];
  bundleKeys: string[];
  onSave: (location: CfgShopLocation) => void;
  addNew: (locationId: number, location: CfgShopLocation) => void;
  onDelete: () => void;
}
const Manipulator = ({
  selectedRecords,
  bundleKeys,
  addNew,
  onSave,
  onDelete,
}: ManipulatorProps): ReactElement => {
  const [banningFlags, setBanningFlags] = useState<boolean>(false);
  const [bannedFlags, setBannedFlags] = useState<string[] | null>(null);
  const [bundleKey, setBundleKey] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [taxRate, setTaxRate] = useState<number | null>(null);

  const anySelected = selectedRecords.length > 0;
  const bundleKeyValid = bundleKey !== null && bundleKey !== "";
  const bannedFlagsValid = true;
  const taxRateValid = taxRate === null || (taxRate >= 0 && taxRate <= 100);

  const savePossible =
    bundleKeyValid &&
    bannedFlagsValid &&
    taxRateValid &&
    (anySelected || isLocationIdValid(locationId));

  const save = () => {
    if (!savePossible) {
      return;
    }
    const location: CfgShopLocation = {
      bundleKey,
      taxRate: taxRate ? taxRate / 100 : 0,
      bannedFlags: bannedFlags ?? [],
    };
    if (anySelected) {
      onSave(location);
    } else {
      addNew(locationId!, location);
    }
  };

  return (
    <>
      {banningFlags && (
        <ContentPortal>
          <Popup
            onClickOutside={() => setBanningFlags(false)}
            childrenClassName={classNames("overflow-auto")}
            percentage="90"
          >
            <BannedFlagsSelector
              selectedRecords={selectedRecords}
              bannedFlags={bannedFlags ?? []}
              setBannedFlags={setBannedFlags}
            />
          </Popup>
        </ContentPortal>
      )}
      <div className={classNames("w-full", "flex", "items-end", "space-x-4")}>
        <span className={classNames("flex-grow")} />

        {/* Location ID Input */}
        <NumberInput
          min={LOCATION_MIN}
          max={LOCATION_MAX}
          title="Location ID"
          value={anySelected ? null : locationId}
          disabled={anySelected}
          setValue={(n: number | null) => setLocationId(n)}
        />

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

        {/* Banned Flags Button */}
        <Button variant="lightblue" onClick={() => setBanningFlags(true)}>
          Banned Flags
        </Button>

        {/* Delete Button */}
        <Button variant="failure" disabled={!anySelected} onClick={onDelete}>
          Delete
        </Button>

        {/* Save Button */}
        <Button variant="success" disabled={!savePossible} onClick={save}>
          {anySelected ? "Save" : "Add"}
        </Button>

        <span className={classNames("flex-grow")} />
      </div>
    </>
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
    LocationIdColumn(),
    LocationKindColumn(),
    useSearchableLocationColumn(),
    useSearchableSystemColumn(),
    useSearchableRegionColumn(),
    useSearchableBundleKeyColumn(undefined, "Template"),
    TaxRateColumn(),
    useSearchableBannedFlagsColumn(),
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
