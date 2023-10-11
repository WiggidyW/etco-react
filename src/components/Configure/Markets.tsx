"use client";

import { ReactElement, useMemo, useState } from "react";
import AntTable, { ColumnType } from "antd/es/table";
import { CfgMarket, LocationInfo } from "@/proto/etco";
import { ModificationState } from "./modificationState";
import { Popup } from "@/components/Popup";
import {
  LocationIdColumn,
  LocationKindColumn,
  RefreshTokenColumn,
  useSearchableLocationColumn,
  useSearchableMarketNameColumn,
  useSearchableRegionColumn,
  useSearchableSystemColumn,
} from "../Table/Column";
import classNames from "classnames";
import { Button, NumberInput, TextInput } from "../Input/Manipulator";
import { rowClassName } from "../Table/Table";
import { ContentPortal } from "@/components/Content";
import { CharacterSelection } from "../Character/Selection";
import { ConfigureBase } from "./Base";
import {
  LOCATION_MAX,
  LOCATION_MIN,
  isLocationIdStructure,
  isLocationIdValid,
} from "../../utils/locationId";
import { cfgGetMarketsLoad } from "@/server-actions/grpc/cfgGet";
import { cfgMergeMarkets } from "@/server-actions/grpc/cfgMerge";

export interface ConfigureMarketsProps {
  refreshToken: string;
  undoCap?: number;
  redoCap?: number;
  marketCharactersKey: string;
}
export const ConfigureMarkets = ({
  refreshToken,
  undoCap,
  redoCap,
  marketCharactersKey,
}: ConfigureMarketsProps): ReactElement => (
  <ConfigureBase
    initial={{}}
    refreshToken={refreshToken}
    actionLoad={cfgGetMarketsLoad}
    actionMerge={cfgMergeMarkets}
    deepClone={deepCloneMarkets}
    mergeUpdates={mergeMarkets}
    undoCap={undoCap}
    redoCap={redoCap}
  >
    {({
      update,
      updated,
      rep: {
        markets,
        locationInfoMap,
        locationNames,
        systemNames,
        regionNames,
      },
    }) => (
      <Configure
        update={update}
        oldMarkets={markets}
        newMarkets={updated}
        locationInfoMap={locationInfoMap}
        locationNames={locationNames}
        systemNames={systemNames}
        regionNames={regionNames}
        marketCharactersKey={marketCharactersKey}
      />
    )}
  </ConfigureBase>
);

const deepCloneMarkets = (markets: {
  [marketName: string]: CfgMarket;
}): { [marketName: string]: CfgMarket } => {
  const clone: { [marketName: string]: CfgMarket } = {};
  for (const [marketName, market] of Object.entries(markets)) {
    clone[marketName] = deepCloneMarket(market);
  }
  return clone;
};
const deepCloneMarket = (market: CfgMarket): CfgMarket => ({ ...market });

const mergeMarkets = (
  markets: { [marketName: string]: CfgMarket },
  updates: { [marketName: string]: CfgMarket }
): void => {
  for (const [marketName, update] of Object.entries(updates)) {
    markets[marketName] = update;
  }
};

const EMPTY: CfgMarket = {
  isStructure: false,
  locationId: 0,
  refreshToken: "",
};

class RecordData {
  newMarkets: { [marketName: string]: CfgMarket } = {};

  constructor(
    readonly oldMarkets: { [marketName: string]: CfgMarket },
    readonly locationInfoMap: { [locationId: string]: LocationInfo },
    readonly locationNames: { [locationId: string]: string },
    readonly systemNames: { [systemId: number]: string },
    readonly regionNames: { [regionId: number]: string }
  ) {}

  newRecords(): Record[] {
    const uniqueMarketNames = new Set<string>();
    for (const marketName in this.oldMarkets) {
      uniqueMarketNames.add(marketName);
    }
    for (const marketName in this.newMarkets) {
      uniqueMarketNames.add(marketName);
    }
    return [...uniqueMarketNames].map(
      (marketName) => new Record(this, marketName)
    );
  }
}

class Record {
  constructor(readonly recordData: RecordData, readonly marketName: string) {}

  private get oldMarket(): CfgMarket | undefined {
    return this.recordData.oldMarkets[this.marketName];
  }
  private get newMarket(): CfgMarket | undefined {
    return this.recordData.newMarkets[this.marketName];
  }
  private get market(): CfgMarket | undefined {
    return this.newMarket ?? this.oldMarket;
  }

  get locationId(): number | undefined {
    return this.market?.locationId;
  }

  private get locationInfo(): LocationInfo | undefined {
    if (this.locationId === undefined) return undefined;
    return this.recordData.locationInfoMap[this.locationId.toString()];
  }

  get forbiddenStructure(): boolean | undefined {
    return this.locationInfo?.forbiddenStructure;
  }
  get systemId(): number | undefined {
    if (this.forbiddenStructure) return undefined;
    return this.locationInfo?.systemId;
  }
  get systemName(): string | undefined {
    if (this.systemId === undefined) return undefined;
    return this.recordData.systemNames[this.systemId];
  }
  get regionId(): number | undefined {
    if (this.forbiddenStructure) return undefined;
    return this.locationInfo?.regionId;
  }
  get regionName(): string | undefined {
    if (this.regionId === undefined) return undefined;
    return this.recordData.regionNames[this.regionId];
  }
  get refreshToken(): string | undefined {
    return this.market?.refreshToken;
  }
  get isStructure(): boolean | undefined {
    return this.market?.isStructure;
  }
  get locationName(): string | undefined {
    if (this.locationId === undefined) return undefined;
    return this.recordData.locationNames[this.locationId.toString()];
  }

  get rowKey(): string {
    return this.marketName;
  }

  getModificationState(): ModificationState {
    if (this.newMarket === undefined) return ModificationState.Unmodified;
    if (
      this.newMarket.locationId === 0 &&
      this.newMarket.refreshToken === "" &&
      this.newMarket.isStructure === false
    ) {
      return ModificationState.Deleted;
    }
    return ModificationState.Modified;
  }
}

interface ConfigureProps {
  update: (updates: { [marketName: string]: CfgMarket }) => void;
  oldMarkets: { [marketName: string]: CfgMarket };
  newMarkets: { [marketName: string]: CfgMarket };
  locationInfoMap: { [locationId: string]: LocationInfo };
  locationNames: { [locationId: string]: string };
  systemNames: { [systemId: number]: string };
  regionNames: { [regionId: number]: string };
  marketCharactersKey: string;
}
const Configure = ({
  update,
  oldMarkets,
  newMarkets,
  locationInfoMap,
  locationNames,
  systemNames,
  regionNames,
  marketCharactersKey,
}: ConfigureProps): ReactElement => {
  const [selected, setSelected] = useState<{
    record: Record;
    rowKey: string;
  } | null>(null);
  const updates = useMemo<{ [marketName: string]: CfgMarket }>(
    () => ({}),
    [newMarkets]
  );
  const recordData = useMemo(
    () =>
      new RecordData(
        oldMarkets,
        locationInfoMap,
        locationNames,
        systemNames,
        regionNames
      ),
    [oldMarkets, locationInfoMap, locationNames, systemNames, regionNames]
  );
  recordData.newMarkets = newMarkets;
  const records = useMemo(
    () => recordData.newRecords(),
    [recordData, newMarkets]
  );

  const setUpdate = (marketName: string, cfgMarket: CfgMarket) => {
    updates[marketName] = cfgMarket;
    update(updates);
  };

  const updateSelected = (cfgMarket: CfgMarket) => {
    if (selected === null) {
      throw new Error("updateSelected called when selected is null");
    }
    setUpdate(selected.rowKey, cfgMarket);
  };

  const deleteSelected = () => {
    if (selected === null) {
      throw new Error("deleteSelected called when selected is null");
    }
    updateSelected(EMPTY);
  };

  const onSave = (marketName: string, cfgMarket: CfgMarket) => {
    if (selected === null) {
      return setUpdate(marketName, cfgMarket);
    }
    if (marketName !== selected.rowKey) {
      throw new Error("onSave called with different marketName than selected");
    }
    updateSelected(cfgMarket);
  };

  return (
    <div className={classNames("inline-block", "p-4", "min-w-full")}>
      <Manipulator
        key={selected?.rowKey ?? "null"}
        selected={selected?.record ?? null}
        onSave={onSave}
        onDelete={deleteSelected}
        marketCharactersKey={marketCharactersKey}
      />
      <div className={classNames("h-4")} />
      <Table records={records} selected={selected} setSelected={setSelected} />
    </div>
  );
};

interface ManipulatorProps {
  selected: Record | null;
  onSave: (marketName: string, market: CfgMarket) => void;
  onDelete: () => void;
  marketCharactersKey: string;
}
const Manipulator = ({
  selected,
  onSave,
  onDelete,
  marketCharactersKey,
}: ManipulatorProps) => {
  const [selectingCharacter, setSelectingCharacter] = useState<boolean>(false);
  const [marketName, setMarketName] = useState<string | undefined>(
    selected?.marketName
  );
  const [locationId, setLocationId] = useState<number | undefined>(
    selected?.locationId
  );
  const [refreshToken, setRefreshToken] = useState<string | undefined>(
    selected?.refreshToken
  );

  const locationIdValid = isLocationIdValid(locationId);
  const isStructure = isLocationIdStructure(locationId);
  const tokenValid = isStructure
    ? refreshToken !== undefined && refreshToken !== "" // must be present
    : true; // not a structure, so no token needed
  const nameValid =
    selected === null
      ? marketName !== null && marketName !== "" // adding new, so must be present
      : true; // existing name is read only

  const savePossible = locationIdValid && tokenValid && nameValid;

  const sameAsSelected =
    selected === null
      ? false
      : selected.locationId === locationId &&
        selected.refreshToken === refreshToken;

  return (
    <>
      {selectingCharacter && (
        <ContentPortal>
          <Popup onClickOutside={() => setSelectingCharacter(false)}>
            <CharacterSelection
              charactersKey={marketCharactersKey}
              onSelect={(character) => {
                setRefreshToken(character.refreshToken);
                setSelectingCharacter(false);
              }}
            />
          </Popup>
        </ContentPortal>
      )}
      <div className={classNames("w-full", "flex", "items-end", "space-x-4")}>
        <span className={classNames("flex-grow")} />

        {/* Name Input */}
        <TextInput
          title="Name"
          value={marketName ?? null}
          setValue={(n: string | null) => setMarketName(n ?? undefined)}
          disabled={selected !== null}
        />

        {/* Location ID Input */}
        <NumberInput
          min={LOCATION_MIN}
          max={LOCATION_MAX}
          title="Location ID"
          value={locationId ? Number(locationId) : null}
          setValue={(n: number | null) =>
            n ? setLocationId(n) : setLocationId(undefined)
          }
        />

        {/* Refresh Token Input */}
        <TextInput
          title="Refresh Token"
          value={refreshToken ?? null}
          setValue={(s: string | null) =>
            s ? setRefreshToken(s) : setRefreshToken(undefined)
          }
          disabled={true}
        />

        {/* Select Character Button */}
        <Button
          variant="lightblue"
          disabled={!isStructure}
          onClick={() => setSelectingCharacter(true)}
        >
          Select Character
        </Button>

        {/* Delete Button */}
        <Button
          onClick={onDelete}
          variant="failure"
          disabled={selected === null}
        >
          Delete
        </Button>

        {/* Save Button */}
        <Button
          variant="success"
          disabled={!savePossible || sameAsSelected}
          onClick={() =>
            savePossible &&
            !sameAsSelected &&
            onSave(marketName!, {
              isStructure,
              locationId: locationId!,
              refreshToken: isStructure ? refreshToken! : "",
            })
          }
        >
          {selected === null ? "Add" : "Save"}
        </Button>

        <span className={classNames("flex-grow")} />
      </div>
    </>
  );
};

interface TableProps {
  records: Record[];
  selected: { record: Record; rowKey: string } | null;
  setSelected: (selected: { record: Record; rowKey: string } | null) => void;
}
const Table = ({
  records,
  selected,
  setSelected,
}: TableProps): ReactElement => {
  const columns: ColumnType<Record>[] = [
    useSearchableMarketNameColumn(),
    LocationKindColumn(),
    useSearchableLocationColumn(),
    useSearchableSystemColumn(),
    useSearchableRegionColumn(),
    RefreshTokenColumn(),
    LocationIdColumn(),
  ];
  return (
    <AntTable
      rowSelection={{
        columnTitle: " ",
        type: "checkbox",
        selectedRowKeys: selected === null ? [] : [selected.rowKey],
        // only one selected at a time
        onSelect: (record) => {
          if (selected !== null && selected.rowKey === record.rowKey) {
            setSelected(null);
          } else
            setSelected({
              record,
              rowKey: record.rowKey,
            });
        },
      }}
      rowClassName={(record) => rowClassName(record)}
      columns={columns}
      dataSource={records}
      rowKey={(record) => record.rowKey}
    />
  );
};
