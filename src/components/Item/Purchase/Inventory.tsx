import { Table } from "antd";
import { PurchaseItem } from "./item";
import { ReactElement, useRef } from "react";
import { ColumnType, ColumnsType } from "antd/es/table";
import { data } from "autoprefixer";
import { useInventoryColumns } from "./InventoryColumns";

const Inventory = ({ items }: { items: PurchaseItem[] }): ReactElement => {
  const columns = useInventoryColumns(items);
  return <Table columns={columns} dataSource={items} />;
};

const TestItems: any[] = [
  {
    typeId: 34,
    quantity: 120406703,
    pricePer: 4.11,
    description: "Jita 110% MinSell",
    location: "Delve",
    name: "Tritanium",
    marketGroups: ["Manufacture & Research", "Materials", "Minerals"],
    group: "Mineral",
    category: "Material",
  },
  {
    typeId: 35,
    quantity: 12040673,
    pricePer: 12.83,
    description: "Jita 110% MinSell",
    location: "1DQ",
    name: "Pyerite",
    marketGroups: ["Manufacture & Research", "Materials", "Minerals"],
    group: "Mineral",
    category: "Material",
  },
  {
    typeId: 45,
    quantity: 654321,
    pricePer: 1.25,
    description: "Jita 111% MinSell",
    location: "Jita",
    name: "Mexallon",
    marketGroups: ["Manufacture & Research", "Materials", "Minerals"],
    group: "Mineral",
    category: "Material",
  },
  {
    typeId: 67,
    quantity: 987654,
    pricePer: 18.76,
    description: "Jita 111% MinSell",
    location: "1DQ",
    name: "Isogen",
    marketGroups: ["Manufacture & Research", "Materials", "Minerals"],
    group: "Mineral",
    category: "Material",
  },
  {
    typeId: 89,
    quantity: 452312,
    pricePer: 0.98,
    description: "Jita 111% MinSell",
    location: "Jita",
    name: "Nocxium",
    marketGroups: ["Manufacture & Research", "Materials", "Minerals"],
    group: "Mineral",
    category: "Material",
  },
  {
    typeId: 91,
    quantity: 789654,
    pricePer: 27.5,
    description: "Jita 111% MinSell",
    location: "1DQ",
    name: "Zydrine",
    marketGroups: ["Manufacture & Research", "Materials", "Minerals"],
    group: "Mineral",
    category: "Material",
  },
  {
    typeId: 104,
    quantity: 123456,
    pricePer: 55.4,
    description: "Jita 111% MinSell",
    location: "Jita",
    name: "Megacyte",
    marketGroups: ["Manufacture & Research", "Materials", "Minerals"],
    group: "Mineral",
    category: "Material",
  },
  {
    typeId: 130,
    quantity: 9876543,
    pricePer: 0.89,
    description: "Jita 1110% MinSell",
    location: "1DQ",
    name: "Morphite",
    marketGroups: ["Manufacture & Research", "Materials", "Minerals"],
    group: "Mineral",
    category: "Material",
  },
  {
    typeId: 182,
    quantity: 4512367,
    pricePer: 3.75,
    description: "Jita 111% MinSell",
    location: "Jita",
    name: "Tritanium Carbide",
    marketGroups: ["Manufacture & Research", "Materials", "Composites"],
    group: "Composite",
    category: "Material",
  },
];

export const TestInventory = (): ReactElement => {
  return <Inventory items={TestItems.map((o) => PurchaseItem.fromObject(o))} />;
};
