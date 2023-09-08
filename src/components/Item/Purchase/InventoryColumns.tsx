import { ColumnType } from "antd/es/table";
import { PurchaseItem } from "./item";
import { ColumnFilterItem } from "antd/es/table/interface";
import { Key, MutableRefObject, RefObject, useRef, useState } from "react";

const newStringFilter = (strings: Set<string>): ColumnFilterItem[] =>
  Array.from(strings).map((s) => ({ text: s, value: s }));

const newInventoryColumns = (
  items: PurchaseItem[],
  nameSearchRef: MutableRefObject<string>
): ColumnType<PurchaseItem>[] => {
  const locationsSet = new Set<string>();
  const groupsSet = new Set<string>();
  const categoriesSet = new Set<string>();
  const marketGroupsSet = new Set<string>();
  for (const item of items) {
    locationsSet.add(item.location);
    groupsSet.add(item.group);
    categoriesSet.add(item.category);
    for (const marketGroup of item.marketGroups) {
      marketGroupsSet.add(marketGroup);
    }
  }

  const columns: ColumnType<PurchaseItem>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      filterIcon: (filtered: boolean) => {
        const [text, setText] = useState<string>("");
        return (
          <>
            <input
              type="text"
              placeholder="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={(e) => {
                nameSearchRef.current = e.target.value.toLowerCase();
              }}
              className={`w-32 px-2 py-1 border${
                filtered ? " border-blue-500" : ""
              } rounded`}
            />
          </>
        );
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
        if (nameSearchRef.current === "") {
          if (selectedKeys.length !== 0) {
            setSelectedKeys([]);
            confirm();
          }
        } else {
          if (
            selectedKeys.length === 0 ||
            selectedKeys[0] !== nameSearchRef.current
          ) {
            setSelectedKeys([nameSearchRef.current as Key]);
            confirm();
          }
        }
        console.log("Hello");
        return <></>;
      },
      onFilter: (value, record) => record.nameLower.includes(value as string),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      filters: newStringFilter(locationsSet),
      onFilter: (value, record) => record.location === value,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: newStringFilter(categoriesSet),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "Group",
      dataIndex: "group",
      key: "group",
      filters: newStringFilter(groupsSet),
    },
    {
      title: "Market Group",
      dataIndex: "marketGroups",
      key: "marketGroups",
      render: (_, p: PurchaseItem) => <>{p.marketGroups.join(" / ")}</>,
      filters: newStringFilter(marketGroupsSet),
      onFilter: (value, record) => record.marketGroupsSet.has(value as string),
    },
    {
      title: "Price Per",
      dataIndex: "pricePer",
      key: "pricePer",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
  ];
  return columns;
};

export const useInventoryColumns = (
  items: PurchaseItem[]
): ColumnType<PurchaseItem>[] => {
  const nameSearchRef = useRef<string>("");
  const columnsRef = useRef<ColumnType<PurchaseItem>[]>();
  if (columnsRef.current === undefined)
    columnsRef.current = newInventoryColumns(items, nameSearchRef);
  return columnsRef.current;
};
