"use client";

import AntTable, { ColumnType } from "antd/es/table";
import { ReactElement } from "react";
import { rowClassName } from "@/components/Table/Table";
import {
  useSearchableMarketGroupColumn,
  useSearchableCategoryColumn,
  useSearchableTypeNameColumn,
  useSearchableGroupColumn,
  PricePerUnitColumn,
  DescriptionColumn,
  QuantityColumn,
  CartColumn,
} from "@/components/Table/Column";
import { Record } from "./ItemRecord";

export interface InventoryTableProps {
  records: Record[];
  setCartQuantity: (index: number, quantity: number | null) => void;
}
export const InventoryTable = ({
  records,
  setCartQuantity,
}: InventoryTableProps): ReactElement => {
  const columns: ColumnType<Record>[] = [
    useSearchableTypeNameColumn(undefined, true),
    CartColumn(
      (record, quantity) => setCartQuantity(record.index, quantity),
      "whitespace-nowrap"
    ),
    QuantityColumn("whitespace-nowrap"),
    PricePerUnitColumn("whitespace-nowrap"),
    DescriptionColumn(),
    useSearchableGroupColumn("text-sm"),
    useSearchableCategoryColumn("text-sm"),
    useSearchableMarketGroupColumn("text-sm", 2),
  ];
  return (
    <AntTable
      // className={classNames("whitespace-nowrap")}
      dataSource={records}
      rowKey={(record) => record.rowKey}
      rowClassName={(record) => rowClassName(record)}
      columns={columns}
    />
  );
};
