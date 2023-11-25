"use client";

import { ReactElement, useEffect, useMemo, useState } from "react";
import AntTable, { ColumnType } from "antd/es/table";
import { ModificationState } from "./modificationState";
import { CfgAuthList } from "@/proto/etco";
import {
  IdColumn,
  BannedFmtColumn,
  KindFmtColumn,
  EntityNameColumn,
} from "../Table/Column";
import { rowClassName } from "../Table/Table";
import classNames from "classnames";
import { Button, ManipulatorSelector, NumberInput } from "../Input/Manipulator";
import { ConfigureBase } from "./Base";
import {
  CfgGetAuthListLoadRep,
  resultCfgGetUserAuthListLoad,
  resultCfgGetAdminAuthListLoad,
} from "@/server-actions/grpc/cfgGet";
import {
  resultCfgSetUserAuthList,
  resultCfgSetAdminAuthList,
} from "@/server-actions/grpc/cfgMerge";
import { Entity, EntityKind } from "@/browser/entity";

export type Domain = "user" | "admin";

export interface ConfigureAuthListProps {
  domain: Domain;
  refreshToken: string;
  undoCap?: number;
  redoCap?: number;
}
export const ConfigureAuthList = ({
  domain,
  refreshToken,
  undoCap,
  redoCap,
}: ConfigureAuthListProps): ReactElement => (
  <ConfigureBase
    initial={{
      bannedCharacterIds: [0], // AAAAAAHHHHHHHH (hack to force initial update)
      permitCharacterIds: [],
      bannedCorporationIds: [],
      permitCorporationIds: [],
      permitAllianceIds: [],
    }}
    refreshToken={refreshToken}
    actionLoad={(token) =>
      domain === "user"
        ? resultCfgGetUserAuthListLoad(token)
        : resultCfgGetAdminAuthListLoad(token)
    }
    actionMerge={(token, updated) =>
      domain === "user"
        ? resultCfgSetUserAuthList(token, updated)
        : resultCfgSetAdminAuthList(token, updated)
    }
    deepClone={deepCloneAuthList}
    mergeUpdates={mergeAuthLists}
    undoCap={undoCap}
    redoCap={redoCap}
  >
    {({ update, updated, rep }) => (
      <Configure update={update} oldAuthList={rep} newAuthList={updated} />
    )}
  </ConfigureBase>
);

const deepCloneAuthList = ({
  bannedCharacterIds,
  permitCharacterIds,
  bannedCorporationIds,
  permitCorporationIds,
  permitAllianceIds,
}: CfgAuthList): CfgAuthList => ({
  bannedCharacterIds: [...bannedCharacterIds],
  permitCharacterIds: [...permitCharacterIds],
  bannedCorporationIds: [...bannedCorporationIds],
  permitCorporationIds: [...permitCorporationIds],
  permitAllianceIds: [...permitAllianceIds],
});

const mergeAuthLists = (authList: CfgAuthList, updates: CfgAuthList): void => {
  Object.assign(authList, updates);
};

const newAuthList = (): CfgAuthList => ({
  bannedCharacterIds: [],
  permitCharacterIds: [],
  bannedCorporationIds: [],
  permitCorporationIds: [],
  permitAllianceIds: [],
});

interface AuthListSet {
  bannedCharacterIds: Set<number>;
  permitCharacterIds: Set<number>;
  bannedCorporationIds: Set<number>;
  permitCorporationIds: Set<number>;
  permitAllianceIds: Set<number>;
}

const newAuthListSet = ({
  bannedCharacterIds,
  permitCharacterIds,
  bannedCorporationIds,
  permitCorporationIds,
  permitAllianceIds,
}: CfgAuthList): AuthListSet => ({
  bannedCharacterIds: new Set(bannedCharacterIds),
  permitCharacterIds: new Set(permitCharacterIds),
  bannedCorporationIds: new Set(bannedCorporationIds),
  permitCorporationIds: new Set(permitCorporationIds),
  permitAllianceIds: new Set(permitAllianceIds),
});

type RecordKind =
  | { kind: "character" | "corporation"; banned: boolean }
  | { kind: "alliance"; banned: false };

const KindEntriesStockProperty = {
  rep: [
    "bannedCharacters",
    "permitCharacters",
    "bannedCorporations",
    "permitCorporations",
    "permitAlliances",
  ],
  list: [
    "bannedCharacterIds",
    "permitCharacterIds",
    "bannedCorporationIds",
    "permitCorporationIds",
    "permitAllianceIds",
  ],
};
function getKindEntries(
  stockKind: "rep",
  stock: CfgGetAuthListLoadRep,
  recordKind: RecordKind
): Map<number, Entity>;
function getKindEntries(
  stockKind: "list",
  stock: AuthListSet,
  recordKind: RecordKind
): Set<number>;
function getKindEntries(
  stockKind: "list",
  stock: CfgAuthList,
  recordKind: RecordKind
): number[];
function getKindEntries(
  stockKind: "rep" | "list",
  stock: CfgGetAuthListLoadRep | AuthListSet | CfgAuthList,
  { kind, banned }: RecordKind
): Map<number, Entity> | Set<number> | number[] {
  // Calculate the index based on the kind and banned status
  let propIndex = 0;
  if (kind === "character") propIndex = banned ? 0 : 1;
  else if (kind === "corporation") propIndex = banned ? 2 : 3;
  /* if (recordKind.kind === "alliance") */ else propIndex = 4;

  // Get the property based on its index
  const property = KindEntriesStockProperty[stockKind][propIndex];
  return stock[property as keyof typeof stock];
}

class RecordData {
  private _newAuthList: CfgAuthList;
  private _newAuthListSet: AuthListSet;

  constructor(readonly oldAuthList: CfgGetAuthListLoadRep) {
    this._newAuthList = newAuthList();
    this._newAuthListSet = newAuthListSet(this._newAuthList);
  }

  get newAuthList(): CfgAuthList {
    return this._newAuthList;
  }
  get newAuthListSet(): AuthListSet {
    return this._newAuthListSet;
  }
  set newAuthList(newAuthList: CfgAuthList) {
    this._newAuthList = newAuthList;
    this._newAuthListSet = newAuthListSet(newAuthList);
  }

  getOldKindMap(recordKind: RecordKind): Map<number, Entity> {
    return getKindEntries("rep", this.oldAuthList, recordKind);
  }
  getNewKindSet(recordKind: RecordKind): Set<number> {
    return getKindEntries("list", this.newAuthListSet, recordKind);
  }

  private iterPushRecords(records: Record[], kind: RecordKind): void {
    const idMap = this.getOldKindMap(kind);
    const idSet = this.getNewKindSet(kind);
    for (const id of idSet) {
      records.push(new Record(this, id, kind));
    }
    for (const id of idMap.keys()) {
      if (idSet.has(id)) {
        continue;
      }
      records.push(new Record(this, id, kind));
    }
  }

  newRecords(): Record[] {
    const records: Record[] = [];
    this.iterPushRecords(records, { kind: "character", banned: true });
    this.iterPushRecords(records, { kind: "character", banned: false });
    this.iterPushRecords(records, { kind: "corporation", banned: true });
    this.iterPushRecords(records, { kind: "corporation", banned: false });
    this.iterPushRecords(records, { kind: "alliance", banned: false });
    return records;
  }
}

class Record {
  constructor(
    readonly recordData: RecordData,
    readonly id: number,
    readonly recordKind: RecordKind
  ) {}

  private get oldKindMap(): Map<number, Entity> {
    return this.recordData.getOldKindMap(this.recordKind);
  }
  private get newKindSet(): Set<number> {
    return this.recordData.getNewKindSet(this.recordKind);
  }

  get kind(): EntityKind {
    return this.recordKind.kind;
  }
  get kindFmt(): string {
    return this.kind.charAt(0).toUpperCase() + this.kind.slice(1);
  }
  get banned(): boolean {
    return this.recordKind.banned;
  }
  get bannedFmt(): string {
    return this.banned ? "Banned" : "Permitted";
  }
  get entity(): Entity | undefined {
    return this.oldKindMap.get(this.id);
  }
  get name(): string | undefined {
    if (this.id === 0) return "CLICK REDO DO NOT COMMIT"; // AAAAAAHHHHHHHH
    return this.entity?.name;
  }
  get ticker(): string | undefined {
    if (this.kind === "character") {
      return undefined;
    } else {
      // @ts-ignore
      return this.entity?.ticker;
    }
  }

  get rowKey(): number {
    return this.id;
  }

  getModificationState(): ModificationState {
    const oldHas = this.oldKindMap.has(this.id);
    const newHas = this.newKindSet.has(this.id);
    if (oldHas && newHas) {
      return ModificationState.Unmodified;
    } else if (oldHas) {
      return ModificationState.Deleted;
    } /* if (newHas) */ else {
      return ModificationState.Modified;
    }
  }
}

interface ConfigureProps {
  update: (update: CfgAuthList) => void;
  oldAuthList: CfgGetAuthListLoadRep;
  newAuthList: CfgAuthList;
}
const Configure = ({
  update,
  oldAuthList,
  newAuthList,
}: ConfigureProps): ReactElement => {
  const [selected, setSelected] = useState<{
    record: Record;
    rowKey: number;
  } | null>(null);
  const updates = useMemo<CfgAuthList>(
    () => deepCloneAuthList(newAuthList),
    [newAuthList]
  );
  const recordData = useMemo(() => new RecordData(oldAuthList), [oldAuthList]);
  recordData.newAuthList = newAuthList;
  const records = useMemo(
    () => recordData.newRecords(),
    [recordData, newAuthList]
  );

  // AAAAAAHHHHHHHH
  // Update current state to match original state
  useEffect(() => {
    if (
      newAuthList.bannedCharacterIds.length === 1 &&
      newAuthList.bannedCharacterIds[0] === 0
    ) {
      updates.bannedCharacterIds = Array.from(
        oldAuthList.bannedCharacters.keys()
      );
      updates.permitCharacterIds = Array.from(
        oldAuthList.permitCharacters.keys()
      );
      updates.bannedCorporationIds = Array.from(
        oldAuthList.bannedCorporations.keys()
      );
      updates.permitCorporationIds = Array.from(
        oldAuthList.permitCorporations.keys()
      );
      updates.permitAllianceIds = Array.from(
        oldAuthList.permitAlliances.keys()
      );
    }
    update(updates);
  }, []);

  const onSave = (id: number, recordKind: RecordKind): void => {
    getKindEntries("list", updates, recordKind).push(id);
    update(updates);
  };

  const onDelete = () => {
    if (selected === null) {
      throw new Error("deleteSelected called when selected is null");
    }
    const entries = getKindEntries("list", updates, selected.record.recordKind);
    entries.splice(entries.indexOf(selected.record.id), 1);
    update(updates);
    setSelected(null);
  };

  return (
    <div className={classNames("inline-block", "p-4", "min-w-full")}>
      <Manipulator
        anySelected={selected !== null}
        onSave={onSave}
        onDelete={onDelete}
      />
      <div className={classNames("h-4")} />
      <Table records={records} selected={selected} setSelected={setSelected} />
    </div>
  );
};

interface ManipulatorProps {
  anySelected: boolean;
  onSave: (id: number, kind: RecordKind) => void;
  onDelete: () => void;
}
const Manipulator = ({
  anySelected,
  onSave,
  onDelete,
}: ManipulatorProps): ReactElement => {
  const [id, setId] = useState<number | null>(null);
  const [kindString, setKindString] = useState<EntityKind | null>(null);
  const [kindBanned, setKindBanned] = useState<boolean | null>(null);

  const savePossible =
    id !== null &&
    kindString !== null &&
    (kindString === "alliance" || kindBanned !== null);

  const fmtKindBanned =
    kindBanned === null ? null : kindBanned ? "Banned" : "Permitted";
  const unfmtSetKindBanned = (v: string | null): void => {
    if (v === null) setKindBanned(null);
    else setKindBanned(v === "Banned");
  };

  const fmtKindString =
    kindString === null
      ? null
      : kindString.charAt(0).toUpperCase() + kindString.slice(1);
  const unfmtSetKindString = (v: string | null): void => {
    if (v === null) return setKindString(null);
    else setKindString((v.charAt(0).toLowerCase() + v.slice(1)) as EntityKind);
  };

  return (
    <div className={classNames("w-full", "flex", "items-end", "space-x-4")}>
      <span className={classNames("flex-grow")} />

      {/* ID input */}
      <NumberInput min={0} title="ID" value={id} setValue={setId} />

      {/* Kind String Selection */}
      <ManipulatorSelector
        options={["Character", "Corporation", "Alliance"]}
        title="Select ID Kind"
        selected={fmtKindString}
        setSelected={unfmtSetKindString}
      />

      {/* Kind Banned Selection */}
      <ManipulatorSelector
        options={["Banned", "Permitted"]}
        title="Ban or Permit"
        selected={fmtKindBanned}
        setSelected={unfmtSetKindBanned}
      />

      {/* Delete Button */}
      <Button variant="failure" disabled={!anySelected} onClick={onDelete}>
        Delete
      </Button>

      {/* Save Button */}
      <Button
        variant="success"
        disabled={anySelected || !savePossible}
        onClick={() =>
          savePossible &&
          onSave(
            id,
            kindString === "alliance"
              ? { kind: kindString, banned: false }
              : { kind: kindString, banned: kindBanned! }
          )
        }
      >
        Save
      </Button>

      <span className={classNames("flex-grow")} />
    </div>
  );
};

interface TableProps {
  records: Record[];
  selected: { record: Record; rowKey: number } | null;
  setSelected: (selected: { record: Record; rowKey: number } | null) => void;
}
const Table = ({
  records,
  selected,
  setSelected,
}: TableProps): ReactElement => {
  const columns: ColumnType<Record>[] = [
    EntityNameColumn(),
    IdColumn(),
    KindFmtColumn(),
    BannedFmtColumn(),
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
