"use client";

import { LOCATION_FLAGS } from "@/staticdata/sde_location_flags";
import { ModificationState } from "./modificationState";
import { RowKeyStringColumn } from "../Table/Column";
import { ReactElement, useMemo } from "react";
import { rowClassName } from "../Table/Table";
import classNames from "classnames";
import { Table } from "antd";

class BannedFlag {
  constructor(public readonly name: string) {}
  get rowKey(): string {
    return this.name;
  }
  getModificationState(): ModificationState {
    return ModificationState.Unmodified;
  }
}

export interface BannedFlagSelectorProps {
  selectedRecords: { bannedFlags: string[] | undefined }[];
  setBannedFlags: (bannedFlags: string[]) => void;
  bannedFlags: string[];
}
export const BannedFlagsSelector = ({
  selectedRecords,
  bannedFlags,
  setBannedFlags,
}: BannedFlagSelectorProps): ReactElement => {
  const flagRecords = useMemo<BannedFlag[]>(
    () => LOCATION_FLAGS.map((flag) => new BannedFlag(flag)),
    []
  );

  // import all flags banned by all records
  const importSelectionAND = (): void => {
    const andFlags = new Set<string>(selectedRecords[0].bannedFlags ?? []);

    for (let i = 1; i < selectedRecords.length; i++) {
      const currentFlags = new Set<string>(
        selectedRecords[i].bannedFlags ?? []
      );
      for (const andFlag of andFlags) {
        if (!currentFlags.has(andFlag)) {
          andFlags.delete(andFlag);
        }
      }
      if (andFlags.size === 0) break;
    }

    setBannedFlags([...andFlags]);
  };

  // import all flags banned by any record
  const importSelectionOR = (): void => {
    const orFlags = new Set<string>(selectedRecords[0].bannedFlags ?? []);

    for (let i = 1; i < selectedRecords.length; i++) {
      for (const flag of selectedRecords[i].bannedFlags ?? []) {
        orFlags.add(flag);
      }
    }

    setBannedFlags([...orFlags]);
  };

  return (
    <Table
      rowKey={(f: BannedFlag) => f.rowKey}
      dataSource={flagRecords}
      rowSelection={{
        selectedRowKeys: bannedFlags,
        type: "checkbox",
        onChange: (selectedRowKeys) =>
          setBannedFlags(selectedRowKeys as string[]),
      }}
      rowClassName={(f: BannedFlag) => rowClassName(f)}
      columns={[RowKeyStringColumn(undefined, "Flag")]}
      pagination={{
        showTotal: () =>
          selectedRecords.length > 0 && (
            <div className={classNames("absolute", "left-0", "bottom-0")}>
              <button
                className={classNames("mr-1")}
                onClick={importSelectionAND}
              >
                Import AND
              </button>
              <button onClick={importSelectionOR}>Import OR</button>
            </div>
          ),
      }}
    />
  );
};
