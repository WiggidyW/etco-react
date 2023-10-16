import { ReactElement, useEffect, useRef, useState } from "react";
import Table, { TableProps } from "antd/es/table";
import Checkbox from "antd/es/checkbox/Checkbox";
import { ModificationState } from "../Configure/modificationState";
import classNames from "classnames";
import {
  Key,
  RowSelectMethod,
  TableCurrentDataSource,
} from "antd/es/table/interface";
import { AnyObject } from "antd/es/_util/type";
import "./Table.css";
import { Tab } from "../Tab";

export const rowClassName = <
  T extends { getModificationState: () => ModificationState }
>(
  record: T
): string => {
  switch (record.getModificationState()) {
    case ModificationState.Unmodified:
      return "cfg-unmodified-row";
    case ModificationState.Modified:
      return "cfg-modified-row";
    case ModificationState.Deleted:
      return "cfg-deleted-row";
  }
};

export interface TableTabsProps {
  oldTabs: Set<string>;
  newTabs: Set<string>;
  addTab: (tab: string) => void;
  selectedTab: string | null;
  setSelectedTab: (tab: string) => void;
}

export const TableTabs = ({
  oldTabs,
  newTabs,
  addTab,
  selectedTab,
  setSelectedTab,
}: TableTabsProps): ReactElement => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const newTabInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddTab = (tab: string) => {
    setIsAdding(false);
    if (tab === "" || oldTabs.has(tab) || newTabs.has(tab)) return;
    addTab(tab);
  };

  useEffect(() => {
    if (isAdding) {
      newTabInputRef.current?.focus();
    }
  }, [isAdding]);

  return (
    <div className="flex space-x-2">
      {[...oldTabs, ...newTabs].map((tab, i) => (
        <Tab
          key={tab}
          active={tab === selectedTab}
          onClick={() => setSelectedTab(tab)}
          connect={"bottom"}
        >
          {tab}
        </Tab>
      ))}
      {!isAdding ? (
        <Tab connect={"bottom"} onClick={() => setIsAdding(true)}>
          +
        </Tab>
      ) : (
        <input
          ref={newTabInputRef}
          onBlur={(e) => handleAddTab(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddTab(e.currentTarget.value);
          }}
        />
      )}
    </div>
  );
};

export interface SelectAllableTableProps<R extends AnyObject, K extends Key>
  extends TableProps<R> {
  dataSource: R[]; // different than datasource to allow customization
  selectedRecords: R[];
  selectedRowKeys: K[];
  setSelected: (selectedRecords: R[], selectedRowKeys: K[]) => void;
  empty?: boolean;
}

export const SelectAllableTable = <R extends { rowKey: K }, K extends Key>({
  dataSource,
  selectedRecords,
  selectedRowKeys,
  setSelected,
  empty = false,
  rowSelection: rowSelectionProps,
  pagination: paginationProps,
  ...tableProps
}: SelectAllableTableProps<R, K>): ReactElement => {
  const [filteredRecords, setFilteredRecords] = useState<R[]>(dataSource);
  const [filteredRowKeys, setFilteredRowKeys] = useState<K[]>(() =>
    dataSource.map((record) => record.rowKey)
  );
  const [selectOnFilter, setSelectOnFilter] = useState<boolean>(false);
  const [allMatchesSelected, setAllMatchesSelected] = useState<
    boolean | undefined
  >(false);

  const getSelectedNonMatches = (): [R[], K[]] => {
    const nonMatchRecords = new Array<R>(selectedRecords.length);
    const nonMatchRowKeys = new Array<K>(selectedRecords.length);
    const filteredRowKeysSet = new Set(filteredRowKeys);

    let currentLen = 0;
    for (let i = 0; i < selectedRecords.length; i++) {
      if (filteredRowKeysSet.has(selectedRowKeys[i])) continue;
      nonMatchRowKeys[currentLen] = selectedRowKeys[i];
      nonMatchRecords[currentLen] = selectedRecords[i];
      currentLen++;
    }

    return [
      nonMatchRecords.slice(0, currentLen),
      nonMatchRowKeys.slice(0, currentLen),
    ];
  };

  const discernAllMatchesSelected = (): boolean => {
    if (allMatchesSelected !== undefined) {
      return allMatchesSelected;
    } else if (selectedRecords.length < filteredRecords.length) {
      return false;
    } else {
      const selectedRowKeysSet = new Set(selectedRowKeys);
      return filteredRowKeys.every((rowKey) => selectedRowKeysSet.has(rowKey));
    }
  };

  const handleFilterEvent = (newFilteredRecords: R[]): void => {
    const newFilteredRowsKeys = newFilteredRecords.map(
      (record) => record.rowKey
    );
    setFilteredRecords(newFilteredRecords);
    setFilteredRowKeys(newFilteredRowsKeys);
    if (selectOnFilter) setSelected(newFilteredRecords, newFilteredRowsKeys);
  };

  const handleSingleSelectionEvent = (
    newSelectedRecords: R[],
    newSelectedRowKeys: K[],
    select: boolean // select true, deselect false
  ): void => {
    if (allMatchesSelected === true && select === false) {
      // user has deselected a match, so now false
      setAllMatchesSelected(false);
    } else if (allMatchesSelected === false && select === true) {
      // user has selected a match, so now unknowable without comparing arrays
      setAllMatchesSelected(undefined);
    }
    setSelected(newSelectedRecords, newSelectedRowKeys);
    setSelectOnFilter(false); // single selection disables selectOnFilter
  };

  const handleAllSelectionEvent = (): void => {
    // selectOnFilter enabled
    // disable selectOnFilter + deselect all
    if (selectOnFilter) {
      setSelected([], []);
      setSelectOnFilter(false);
      setAllMatchesSelected(false);
      return;
    }

    // selectOnFilter disabled + none selected
    // enable selectOnFilter + select all matches
    if (selectedRecords.length === 0) {
      setSelected(filteredRecords, filteredRowKeys);
      setSelectOnFilter(true);
      setAllMatchesSelected(true);
      return;
    }

    const allMatchesSelectedDiscerned = discernAllMatchesSelected();
    const [selectedNonMatchRecords, selectedNonMatchRowKeys] =
      getSelectedNonMatches();

    // selectOnFilter disabled + all matches selected + some or no other records selected
    // deselect all matches
    if (allMatchesSelectedDiscerned === true) {
      setSelected(selectedNonMatchRecords, selectedNonMatchRowKeys);
      setAllMatchesSelected(false);
    }

    // selectOnFilter disabled + partial or no matches selected + some or no other records selected
    // select all matches
    else {
      if (selectedNonMatchRecords.length === 0) {
        setSelected(filteredRecords, filteredRowKeys);
      } else {
        setSelected(
          [...selectedNonMatchRecords, ...filteredRecords],
          [...selectedNonMatchRowKeys, ...filteredRowKeys]
        );
      }
      setAllMatchesSelected(true);
    }
  };

  const handleOnChange = (
    _: any,
    __: any,
    ___: any,
    { currentDataSource, action }: TableCurrentDataSource<R>
  ) => {
    if (action === "filter") {
      handleFilterEvent(currentDataSource);
    }
  };

  const handleRowSelectionOnChange = (
    newSelectedRowKeys: Key[],
    newSelectedRecords: R[],
    { type }: { type: RowSelectMethod }
  ): void => {
    // 'all' => handleCheckboxTitleOnChange
    if (type !== "all") {
      handleSingleSelectionEvent(
        newSelectedRecords,
        newSelectedRowKeys as K[],
        newSelectedRecords.length > selectedRecords.length
      );
    }
  };

  const handleRowSelectionTitleCheckboxOnChange = (): void =>
    handleAllSelectionEvent();

  return (
    <Table
      {...tableProps}
      rowKey={(record) => record.rowKey}
      dataSource={empty ? [] : dataSource}
      onChange={handleOnChange}
      rowSelection={{
        ...rowSelectionProps,
        selectedRowKeys: selectedRowKeys,
        type: "checkbox",
        onChange: handleRowSelectionOnChange,
        columnTitle: (
          <Checkbox
            checked={selectedRecords.length > 0}
            indeterminate={!selectOnFilter && selectedRecords.length > 0}
            onChange={handleRowSelectionTitleCheckboxOnChange}
          />
        ),
      }}
      pagination={{
        ...paginationProps,
        showTotal: () => (
          <div
            className={classNames(
              "absolute",
              "left-0",
              "bottom-0",
              "font-bold"
            )}
          >
            <span>
              Selected: {selectedRecords.length} / Matches:{" "}
              {filteredRecords.length}
            </span>
          </div>
        ),
      }}
    />
  );
};
